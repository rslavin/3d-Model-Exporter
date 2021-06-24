import {Group, Mesh, MeshBasicMaterial} from 'three';
import {STLExporter} from 'three/examples/jsm/exporters/STLExporter.js';
import {OBJExporter} from 'three/examples/jsm/exporters/OBJExporter.js';
import {SubdivisionModifier} from 'three/examples/jsm/modifiers/SubdivisionModifier.js';
import {saveAs} from 'file-saver';
import jQuery from 'jquery';
import {arrive} from 'arrive';
import {meshProcessor} from './meshProcessor.js';

function saveStl() {
    saveModel()
}

function saveObj() {
    saveModel(false)
}

/**
 * Exports the model as either stl or obj
 * @param stl true for stl (default) or false for obj
 */
function saveModel(stl = true) {
    let qualityVal = jQuery('#export-quality').val();
    let baseQualityVal = jQuery('#export-quality-base').val();
    let smooth = qualityVal > 0 ? qualityVal : undefined;
    let baseSmooth = baseQualityVal > 0 ? baseQualityVal : undefined;
    let mirroredPose = CK.character.data.mirroredPose;
    let exporter, type, ext;

    // process creation kit character
    let group = process(CK.character, smooth, baseSmooth, mirroredPose);

    if (!group) {
        console.error('[ERROR] Failed to parse model.');
        return;
    }

    if (stl) {
        exporter = new STLExporter();
        type = "application/sla;charset=utf-8";
        ext = ".stl";
    } else {
        exporter = new OBJExporter();
        type = "text/plain;charset=utf-8";
        ext = ".obj";
    }

    let fileString = exporter.parse(group);
    let blob = new Blob([fileString], {type: type});

    let name = getName().replace(/\s/g, "_");

    let appendName = "-lowres";
    if (qualityVal === '1')
        appendName = "-mediumres";
    else if (qualityVal === '2')
        appendName = "-highres";

    saveAs(blob, name + appendName + ext);
}

function getName() {
    let name = CK.character.data.meta.character_name;
    return name === "" ? "unnamed" : name;
}

/**
 * Smooths the geometry by interpolating additional points
 * @param geometry original geometry
 * @param subdivisions number of subdivisions (1 or 2)
 * @returns {Geometry}
 */
function subdivide(geometry, subdivisions) {
    let modifier = new SubdivisionModifier(subdivisions);
    return modifier.modify(geometry);
}

/**
 * Used when the "Mirror" option is selected in "Pose".
 * Translates the geometry with appropriate weights to mirror the model.
 * @param geometry
 * @returns {{index}|*}
 */
function mirror(geometry) {
    const tempXYZ = [0, 0, 0];
    if (geometry.index) geometry.copy(geometry.toNonIndexed());

    for (let i = 0; i < geometry.attributes.position.array.length / 9; i++) {
        tempXYZ[0] = geometry.attributes.position.array[i * 9];
        tempXYZ[1] = geometry.attributes.position.array[i * 9 + 1];
        tempXYZ[2] = geometry.attributes.position.array[i * 9 + 2];

        geometry.attributes.position.array[i * 9] = geometry.attributes.position.array[i * 9 + 6];
        geometry.attributes.position.array[i * 9 + 1] = geometry.attributes.position.array[i * 9 + 7];
        geometry.attributes.position.array[i * 9 + 2] = geometry.attributes.position.array[i * 9 + 8];

        geometry.attributes.position.array[i * 9 + 6] = tempXYZ[0];
        geometry.attributes.position.array[i * 9 + 7] = tempXYZ[1];
        geometry.attributes.position.array[i * 9 + 8] = tempXYZ[2];
    }

    return geometry;
}

/**
 *
 * @param object3d input model
 * @param smooth subdivisions
 * @param baseSmooth
 * @param mirroredPose whether to mirror the model
 * @returns {Group}
 */
function process(object3d, smooth, baseSmooth, mirroredPose) {
    let material = new MeshBasicMaterial();
    let group = new Group();

    object3d.traverseVisible(function (object) {

        let exporter = new meshProcessor();
        let geometry = exporter.parse(object);

        if (!geometry)
            return null;

        if (mirroredPose === true)
            geometry = mirror(geometry);

        if (smooth && object.name !== 'base')
            geometry = subdivide(geometry, smooth);

        if (baseSmooth && object.name === 'base')
            geometry = subdivide(geometry, baseSmooth);

        let mesh = new Mesh(geometry, material);

        group.add(mesh);
    });
    return group;
}

/**
 * Modifies the web UI
 */
document.body.arrive(".footer", {onceOnly: true, existing: true}, function () {
    let icon_save = '\u{1F4BE}';
    let menuItemStyle = {
        "margin-right": "10px",
        "text-transform": "none"
    };
    let menuStyle = {
        "display": "flex",
        "justify-content": "center",
        "align-content": "center",
        "align-items": "center"
    };

    let menuContainer = jQuery("div[class$='container']").first();
    menuContainer.css(menuStyle);

    let qualitySelector = jQuery("<select />", {
        css: menuItemStyle,
        class: 'jss7 jss9 jss10',
        id: 'export-quality',
        name: 'export-quality',
        title: "Subdivision Passes"
    });
    qualitySelector.append(jQuery("<option></option>").attr("value", 2).text("Highest"))
        .append(jQuery("<option></option>").attr("value", 1).attr("selected", "selected").text("Medium"))
        .append(jQuery("<option></option>").attr("value", 0).text("Lowest"));

    let baseQualitySelector = jQuery("<select />", {
        css: menuItemStyle,
        class: 'jss7 jss9 jss10',
        id: 'export-quality-base',
        name: 'export-quality-base',
        title: "Subdivision Passes (Base)"
    });
    baseQualitySelector.append(jQuery("<option></option>").attr("value", 2).text("Highest"))
        .append(jQuery("<option></option>").attr("value", 1).attr("selected", "selected").text("Medium"))
        .append(jQuery("<option></option>").attr("value", 0).text("Lowest"));

    menuContainer.append(jQuery("<label />", {
        css: menuItemStyle,
        class: "jss7",
        id: 'export-quality-label',
        text: 'Model Quality:',
        title: 'Subdivision Passes',
        for: 'export-quality'
    }))
        .append(qualitySelector)
        .append(jQuery("<label />", {
            css: menuItemStyle,
            class: "jss7",
            id: 'export-quality-base-label',
            text: 'Base Quality:',
            title: 'Subdivision Passes',
            for: 'export-quality-base'
        }))
        .append(baseQualitySelector)
        .append(jQuery("<a />", {
            css: menuItemStyle,
            class: "jss7 jss9 jss10",
            id: 'save-stl',
            text: icon_save + " .stl",
            title: 'Download in STL Format'
        }).on("click", saveStl))
        .append(jQuery("<a />", {
            css: menuItemStyle,
            class: "jss7 jss9 jss10",
            id: 'save-obj',
            text: icon_save + " .obj",
            title: 'Download in OBJ Format'
        }).on("click", saveObj));
});
