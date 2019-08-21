
function loadTreeBuilder(config) {
    const canvas = document.getElementById(config.treeCanvasId);
    const renderButton = document.getElementById(config.renderButtonId);
    const saveButton = document.getElementById(config.saveButtonId);
    const renderError = document.getElementById(config.renderErrorId);

    const inputNames = [
        config.widthSelectorId,
        config.heightSelectorId,
        config.treeSectionsId,
        config.treeSectionLengthId,
        config.treeLengthDecayId,
        config.treeDivisionsId,
        config.treeWidthId,
        config.treeTaperId,
        config.treeSplitAngleId,
        config.fileNameId,
        config.fileTypeId
    ];

    const inputs = Object.fromEntries(inputNames.map(inputId => [inputId,
        document.getElementById(inputId)]));

    const errorMessages = Object.fromEntries(inputNames.map(inputId => [inputId,
        document.getElementById(inputId + "-error")]));

    function getInput(inputId) {
        return inputs[inputId].value;
    }

    const validations = {}
    validations[config.widthSelectorId] =  [
        {type: "integer", msg: "Width must be a valid integer"},
        {type: "min", value: parseInt(inputs[config.widthSelectorId].min),
            msg: "Width must be grater than or equal to " + inputs[config.widthSelectorId].min}
    ];
    validations[config.heightSelectorId] = [
        {type: "integer", msg: "Height must be a valid integer"},
        {type: "min", value: parseInt(inputs[config.heightSelectorId].min),
            msg: "Height must be grater than or equal to " + inputs[config.widthSelectorId].min}
    ];
    validations[config.treeSectionsId] = [
        {type: "integer", msg: "Tree Sections must be a valid integer"},
        {type: "min", value: parseInt(inputs[config.treeSectionsId].min),
            msg: "Tree Sections must be grater than or equal to " + inputs[config.treeSectionsId].min},
        {type: "max", value: parseInt(inputs[config.treeSectionsId].max),
            msg: "Tree Sections must be less than or equal to " + inputs[config.treeSectionsId].max}
    ];
    validations[config.treeSectionLengthId] = [
        {type: "integer", msg: "Tree Sections must be a valid integer"},
        {type: "min", "value": 10, msg: "Tree Section Length must be grater than or equal to 10"},
        {type: "max", "value": 500, msg: "Tree Section Length must be less than or equal to 100"}
    ];
    validations[config.treeLengthDecayId] = [
        {type: "float", msg: "Tree Sections must be a valid number"},
        {type: "min", "value": 0.1, msg: "Tree Length Decay must be grater than or equal to 0.1"},
        {type: "max", "value": 1.0, msg: "Tree Length Decay must be less than or equal to 1.0"}
    ];
    validations[config.treeDivisionsId] = [
        {type: "integer", msg: "Tree Divisions must be a valid integer"},
        {type: "min", value: parseInt(inputs[config.treeDivisionsId].min),
            msg: "Tree Divisions must be grater than or equal to " + inputs[config.treeDivisionsId].min},
        {type: "max", value: parseInt(inputs[config.treeDivisionsId].max),
            msg: "Tree Divisions must be less than or equal to " + inputs[config.treeDivisionsId].max}
    ];
    validations[config.treeWidthId] = [
        {type: "integer", msg: "Tree Width must be a valid integer"},
        {type: "min", value: parseInt(inputs[config.treeWidthId].min),
            msg: "Tree Width must be grater than or equal to " + inputs[config.treeWidthId].min},
        {type: "max", value: parseInt(inputs[config.treeWidthId].max),
            msg: "Tree Width must be less than or equal to " + inputs[config.treeWidthId].max}
    ];
    validations[config.treeTaperId] = [
        {type: "float", msg: "Tree Taper must be a valid number"},
        {type: "min", value: 0.1, msg: "Tree Taper must be grater than or equal to 0.1"},
        {type: "max", value: 1.0, msg: "Tree Taper must be less than or equal to 1.0"}
    ];
    validations[config.treeSplitAngleId] = [
        {type: "float", msg: "Tree Split Angle must be a valid number"},
        {type: "min", value: 15, msg: "Tree Split Angle must be grater than or equal to 15"},
        {type: "max", value: 360, msg: "Tree Split Angle must be less than or equal to 360"}
    ];

    function validateInputById(inputId, updateError) {
        if (!validations[inputId]) {
            return "";
        }
        errorMsg = validateInput(getInput(inputId), validations[inputId]);
        if (updateError) {
            errorMessages[inputId].innerHTML = errorMsg;
        }
        return errorMsg;
    };

    function validateInputs(showErrors) {
        return inputNames.map((inputId) => validateInputById(inputId, showErrors));
    };

    function hasErrors() {
        return validateInputs(true).some((val) => val !== "");
    };

    
    function updateCanvasSize() {
        heightError = validateInputById(config.heightSelectorId, false);
        widthError = validateInputById(config.widthSelectorId, false);
        if (heightError !== "" || widthError !== "") 
            return
        canvas.height = getInput(config.heightSelectorId);
        canvas.width = getInput(config.widthSelectorId);
    };

    function callIfEnter(fun) {
        helper = (e) => {
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13') {
                fun();
            }
        };
        return helper;
    };

    function makeTree() {
        if (hasErrors()) {
            renderError.innerHTML = "Configuration has errors, fix before rendering";
            return;
        }
        renderError.innerHTML = "";
        renderTree();
    }

    function saveTree() {
        var imageType = getInput(config.fileTypeId);
        var imageName = getInput(config.fileNameId);
        if (!imageName.endsWith("." + imageType)) {
            imageName = imageName + "." + imageType;
        }
        let canvasImage = canvas.toDataURL("image/" + imageType);

        // this can be used to download any image from webpage to local disk
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = imageName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove()
        };
        xhr.open('GET', canvasImage); // This is to download the canvas Image
        xhr.send();
    }

    function renderTree() {
        const canvasWidth = getInput(config.widthSelectorId);
        const canvasHeight = getInput(config.heightSelectorId);
        const splitSections = getInput(config.treeSectionsId);
        const treeLength = getInput(config.treeSectionLengthId);
        const treeDecay = getInput(config.treeLengthDecayId);
        const divisions = getInput(config.treeDivisionsId);
        const treeWidth = getInput(config.treeWidthId);
        const taperValue = getInput(config.treeTaperId);
        const splitAngle = getInput(config.treeSplitAngleId) * Math.PI / 180;

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = "white";
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        branches = [{depth: 0, width: treeWidth, angleOffset: Math.PI / 2,
            origin: makePoint(canvasWidth / 2, canvasHeight), 
            lengthPx: treeLength
        }];

        while (branches.length > 0) {
            const branch = branches.shift();

            const moveX = Math.cos(branch.angleOffset) * branch.lengthPx;
            const moveY = -Math.sin(branch.angleOffset) * branch.lengthPx;
            const endpt = makePoint(moveX + branch.origin.x, moveY + branch.origin.y);

            context.beginPath();
            context.lineWidth = branch.width;
            context.moveTo(Math.floor(branch.origin.x), Math.floor(branch.origin.y));
            context.lineTo(Math.floor(endpt.x), Math.floor(endpt.y));
            context.stroke();

            if (branch.depth >= splitSections - 1) {
                continue;
            }

            const newDepth = branch.depth + 1
            const newWidth = branch.width * taperValue;
            const newLength = branch.lengthPx * treeDecay;
            const angleStart = branch.angleOffset - splitAngle / 2;
            const angleStep = splitAngle / (divisions - 1);

            for (var split = 0; split < divisions; split++) {
                var angle = angleStart + angleStep * split;
                var newBranch = {
                    depth: newDepth,
                    width: newWidth,
                    angleOffset: angle,
                    origin: endpt,
                    lengthPx: newLength
                }
                branches.push(newBranch);
            }
        }
    }
    
    function setup() {
        inputs[config.widthSelectorId].addEventListener("change", updateCanvasSize);
        inputs[config.widthSelectorId].addEventListener("keyup", callIfEnter(updateCanvasSize));
        inputs[config.heightSelectorId].addEventListener("change", updateCanvasSize);
        inputs[config.heightSelectorId].addEventListener("keyup", callIfEnter(updateCanvasSize));
        
        inputNames.forEach((name) => {
            inputs[name].addEventListener("change", (e) => validateInputById(name, true));
            inputs[name].addEventListener("keyup", (e) => callIfEnter(() => validateInputById(name, true)));
        });

        renderButton.addEventListener("click", (e) => makeTree());
        saveButton.addEventListener("click", (e) => saveTree());

        updateCanvasSize();

        renderTree();
    };

    setup();
};

function makePoint(x, y) {
    return {"x": +x, "y": +y}
}

function validateInput(value, inputValidations) {
    for (var valIdx = 0; valIdx < inputValidations.length; valIdx++) {
        const validation = inputValidations[valIdx];
        switch(validation.type) {
            case "min":
                if (parseFloat(value) < validation.value) {
                    return validation.msg;
                }
                break;
            case "max":
                if (parseFloat(value) > validation.value) {
                    return validation.msg;
                }
                break;
            case "integer":
                if (value == "" || !value.match(/^-?\d+$/)) {
                    return validation.msg;
                }
            case "float":
                if (value == "" || isNaN(value)) {
                    return validation.msg;
                }
            default:
                break;
        }
    }
    return "";
};

var hasLoaded = false;

window.addEventListener('load', () => {
    if (!hasLoaded) {
        hasLoaded = true;
        loadTreeBuilder(
            {
                treeCanvasId: "tree-canvas",
                renderButtonId: "render-button",
                saveButtonId: "save-button",
                renderErrorId: "render-error",
                widthSelectorId: "width",
                heightSelectorId: "height",
                treeSectionsId: "tree-sections",
                treeSectionLengthId: "tree-section-length",
                treeLengthDecayId: "tree-length-decay",
                treeDivisionsId: "tree-divisions",
                treeWidthId: "tree-width",
                treeTaperId: "tree-taper",
                treeSplitAngleId: "tree-split-angle",
                fileNameId: "file-name",
                fileTypeId: "file-type"
            }
        );
    }
});

