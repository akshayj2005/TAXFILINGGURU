const User = require('../admin/models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .populate('reportingManager', 'fullName')
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { password, ...userData } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ ...userData, password: hashedPassword });
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('-password')
            .populate('reportingManager', 'fullName');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await User.findByIdAndUpdate(id, { status }, { new: true })
            .select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTeamStructure = async (req, res) => {
    try {
        // Only return active users in team hierarchy
        const users = await User.find({ status: 'Active' })
            .populate('reportingManager', 'fullName email')
            .select('fullName email role reportingManager status');

        const teams = {};

        users.forEach(user => {
            const managerId = user.reportingManager ? user.reportingManager._id.toString() : 'unassigned';
            const managerName = user.reportingManager ? user.reportingManager.fullName : 'No Manager';

            if (!teams[managerId]) {
                teams[managerId] = {
                    managerId,
                    managerName,
                    members: []
                };
            }

            teams[managerId].members.push(user);
        });

        res.json(Object.values(teams));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
