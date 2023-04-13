var Jimp = require("jimp");

async function loadBrandLogo(userId) {
    let logo = await Jimp.read(`brandLogos/${userId}.jpg`)
    logo = logo.resize(120, 60)
    return logo
}

async function addIcons(image, line1Width) {
    let phoneIcon = await Jimp.read("icons/phone.png")
    let websiteIcon = await Jimp.read("icons/website.png")
    let addressIcon = await Jimp.read("icons/address.png")

    let imageHeight = image.bitmap.height;
    let imageWidth = image.bitmap.width;

    //resize icons to 23x23
    phoneIcon = phoneIcon.resize(23, 23)
    websiteIcon = websiteIcon.resize(23, 23)
    addressIcon = addressIcon.resize(23, 23)

    //add icons to image
    image.composite(phoneIcon, 50, imageHeight - 50, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
    })

    image.composite(websiteIcon, 50, imageHeight - 90, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
    })

    image.composite(addressIcon, imageWidth - (line1Width + 50), imageHeight - 96, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
    })

    return image
}

async function addBrandDetails(image, brandDetails) {
    //load font

    let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    let imageHeight = image.bitmap.height;
    let imageWidth = image.bitmap.width;

    //add address
    let website = brandDetails.website;
    image.print(font, 80, imageHeight - 95, website);

    //add phone number
    let phoneNumber = brandDetails.phone;
    image.print(font, 80, imageHeight - 55, phoneNumber);

    //address
    let address = brandDetails.address;

    let line1Width = Jimp.measureText(font, address.line1);
    let line2Width = Jimp.measureText(font, address.line2);

    image.print(font, imageWidth - (line1Width + 25), imageHeight - 100, address.line1);
    image.print(font, imageWidth - (line2Width + 25), imageHeight - 50, address.line2);

    image = await addIcons(image, line1Width)

    return image
}

async function mergeImages({ imageName, userId, brandDetails }) {
    let originalImage = await Jimp.read(`uploads/${imageName}`)
    let logo = await loadBrandLogo(userId)

    originalImage.composite(logo, 50, 50, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
    })

    originalImage = await addBrandDetails(originalImage, brandDetails)

    await originalImage.writeAsync(`uploads/${imageName}`);
}

// (async () => {
//     await mergeImages({
//         imageName: "63f0343eda306974517fd53d_1676732920235.jpg",
//         userId: "63f0343eda306974517fd53d",
//         brandDetails: {
//             website: "www.google.com",
//             address: {
//                 line1: "123 Main St",
//                 line2: "Suite 100",
//             },
//             phoneNumber: "123-456-7890"
//         }
//     })
// })()

module.exports = mergeImages

// open a file called "lenna.png"
// Jimp.read("uploads/63f0343eda306974517fd53d_1676731881977.jpg")
//     .then((image) => {
//         loadedImage = image;
//         return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
//     }).then(function (font) {
//         loadedImage.print(font, 50, 50, imageCaption)
//             .write(fileName);
//     })
//     .catch(function (err) {
//         console.error(err);
//     });