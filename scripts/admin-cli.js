#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const { program } = require('commander');
const colors = require('colors');
const dbConfig = require('../config/database');

// Import Models
const Visitor = require('../models/Visitor');
const RequestLog = require('../models/RequestLog');

// Connect to MongoDB (Silent)
mongoose.connect(dbConfig.mongodb.uri, dbConfig.mongodb.options)
    .then(() => {})
    .catch(err => {
        console.error('❌ DB Error:'.red, err.message);
        process.exit(1);
    });

program
    .version('1.0.0')
    .description('Tax Filing Guru - Admin CLI Tool');

// COMMAND: List Online Users
program
    .command('users')
    .description('List currently online users (active within 5 mins)')
    .action(async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const users = await Visitor.find({ lastSeen: { $gte: fiveMinutesAgo } }).sort({ lastSeen: -1 });
            
            console.log(`
Found ${users.length} Online Users:
`.green.bold);
            
            if (users.length === 0) {
                console.log('  (No active users found)'.gray);
            }

            users.forEach(u => {
                const isReturning = (new Date() - u.firstSeen) > (24 * 60 * 60 * 1000);
                const status = isReturning ? '[RETURNING]'.cyan : '[NEW USER]'.yellow;
                
                console.log(`  ${status} ${u.visitorId.white} | IP: ${u.ipAddress} | ${u.location.city || 'Unknown'}, ${u.location.country || 'Unknown'}`);
                console.log(`     L Path: ${u.currentPath.gray}`);
                console.log(`     L Seen: ${u.lastSeen.toLocaleString().gray}
`);
            });
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });

// COMMAND: Show Recent Logs
program
    .command('logs [limit]')
    .description('Show the most recent API audit logs (default: 10)')
    .action(async (limit = 10) => {
        try {
            const logs = await RequestLog.find().sort({ timestamp: -1 }).limit(parseInt(limit));
            
            console.log(`
Showing last ${logs.length} API Requests:
`.green.bold);

            logs.forEach(l => {
                const statusColor = l.statusCode >= 500 ? 'red' : l.statusCode >= 400 ? 'yellow' : 'green';
                console.log(`  [${l.method}] ${l.url} - ${l.statusCode.toString()[statusColor]} (${l.responseTime}ms)`);
                console.log(`     L ID: ${l.requestId.gray}`);
                console.log(`     L IP: ${l.ip} | User: ${l.userId || 'Guest'}`);
                console.log(`     L Time: ${l.timestamp.toLocaleString().gray}
`);
            });
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });

// COMMAND: Search Logs by ID
program
    .command('find <id>')
    .description('Find a specific request log by Request ID or Visitor ID')
    .action(async (id) => {
        try {
            // Try RequestLog
            const reqLog = await RequestLog.findOne({ requestId: id });
            if (reqLog) {
                console.log(`
Found Request Log:`.green.bold);
                console.log(JSON.stringify(reqLog, null, 2));
                process.exit(0);
            }

            // Try Visitor
            const visitor = await Visitor.findOne({ visitorId: id });
            if (visitor) {
                console.log(`
Found Visitor Profile:`.green.bold);
                console.log(JSON.stringify(visitor, null, 2));
                process.exit(0);
            }

            console.log('
No records found for ID: '.red + id);
            process.exit(1);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });

program.parse(process.argv);
