const fs = require('fs');
const path = require('path');

const residentDir = path.join(__dirname, 'views', 'resident');
const nriDir = path.join(__dirname, 'views', 'nri');

const getEjsFiles = (dir) => fs.readdirSync(dir).filter(f => f.endsWith('.ejs')).map(f => path.join(dir, f));
const allFiles = [...getEjsFiles(residentDir), ...getEjsFiles(nriDir)];

let updatedCount = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We only want to transform the left pamphlet HTML text sizes, which are before the form.
    const splitStr = '<div class="p-8 md:p-14 bg-white flex flex-col justify-center';
    const splitIndex = content.indexOf(splitStr);

    if (splitIndex === -1) continue;

    let leftSide = content.substring(0, splitIndex);
    let rightSide = content.substring(splitIndex);

    // Make regular text larger: text-sm -> text-base or text-lg
    // The subtitle `<p class="text-sm text-gray-500 mb-1">`
    leftSide = leftSide.replace(/class="text-sm text-gray-500 mb-1"/g, 'class="text-base text-gray-500 mb-1"');

    // The description `<p class="text-gray-600 text-sm mb-5...`
    leftSide = leftSide.replace(/text-gray-600 text-sm mb-5/g, 'text-gray-600 text-base mb-5');

    // The list items: text-sm -> text-base
    leftSide = leftSide.replace(/text-gray-800 text-sm font-medium/g, 'text-gray-800 text-base font-semibold');

    // SVG icons from w-5 h-5 -> w-6 h-6
    leftSide = leftSide.replace(/class="w-5 h-5 text-green-500/g, 'class="w-6 h-6 text-green-500');

    // The title itself "text-3xl font-black"
    leftSide = leftSide.replace(/text-3xl font-black/g, 'text-4xl font-black tracking-tight');

    // Wider card on md screens (up to max-w-lg)
    leftSide = leftSide.replace(/w-\[95%\] md:w-\[90%\] max-w-md/g, 'w-[95%] md:w-[90%] max-w-lg md:p-10');

    if (leftSide !== content.substring(0, splitIndex)) {
        fs.writeFileSync(file, leftSide + rightSide);
        updatedCount++;
    }
}
console.log(`Updated textual size in ${updatedCount} plan files!`);
