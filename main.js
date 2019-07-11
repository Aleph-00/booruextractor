let maxPathLength = 255;

let underTags = '';
var getting =
browser.storage.local.get("underTags")
    .then((result) => {
      underTags = result.underTags || "animated 3d";
    },
    (error) => {
        console.log(`Error restoring options: ${error}`);
    });

// Set listeners
browser.runtime.onMessage.addListener(download);
browser.storage.onChanged.addListener(updateOptions);

// Update options, if changed
function updateOptions(changes, area) {
    if (area == 'local') {
        var changedItems = Object.keys(changes);
        for (let item of changedItems) {
            if (item == 'underTags') {
                underTags = changes[item].newValue;
            }
        }
    }
}

function download(message) {
    console.log("Image data: " + JSON.stringify(message));
    DownloadImage(message);
}

// Downloader
function DownloadImage(data) {

    // Lets start constructing file path
    let fileName = CleanFileName(data.fileName);
    let dirPath = 'booruextractor/' + data.folder;

    // Check for subFolder
    if (data.subFolder != null) {
        if (data.subFolder.length > 0) {
            dirPath = CheckFolder(dirPath, fileName, data.subFolder);
        }
    }

    // Analyze tags
    if (underTags.length > 0 & data.tags != null) {
        let tags = data.tags.split(" ");
        let crossTags = underTags.split(" ").filter(function (n) {
            return tags.indexOf(n) != -1
        });
        if (crossTags.length > 0) {
            dirPath = CheckFolder(dirPath, fileName, crossTags[0]);
        }
    }

    // Download file
    let path = dirPath + '/' + fileName;
    console.log('download path: ' + path);

    let downloading = browser.downloads.download({
        url: data.url,
        filename: path,
        conflictAction: 'overwrite',
        saveAs: false
    });
}

// Check for folder presence and create it, if needed
function CheckFolder(currentDir, fileName, addOn) {

    // Check for max length, allowed by OS
    let cleanAddOn = CleanDirectory(addOn);
    if ((currentDir + '/' + cleanAddOn + '/' + fileName).length > maxPathLength) {
        return currentDir;
    }

    let newCurrentDir = currentDir + '/' + cleanAddOn;

    return newCurrentDir;
}

function CleanFileName(name) {
    return name.replace(/[<>:"\/\\|?*\x00-\x1F]/gi, '_'); // Strip any special characters
}

function CleanDirectory(name) {
    return name.replace(/[<>"|?*\x00-\x1F]/gi, '_'); // Strip any special characters
}
