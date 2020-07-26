import {Matrix4, Vector3, Vector4} from "three";

let meshProcessor = function () {
};

meshProcessor.prototype = {

    constructor: meshProcessor,

    parse: function (mesh) {

        if (!mesh.isMesh) {
            return null;
        }

        let geometry = mesh.geometry;
        if (!geometry.isBufferGeometry) {
            console.warn('[ERROR] Geometry type unsupported: ', mesh);
            return null;
        }

        let vertices = geometry.getAttribute('position');
        if (vertices === undefined) {
            console.warn('[ERROR] Vertices are undefined: ', mesh);
            return null;
        }

        let vertex = new Vector3();
        let nbVertex = 0;
        let matrixRotation = new Matrix4().makeRotationX(90 * Math.PI / 180);
        let matrixScale = new Matrix4().makeScale(10, 10, 10);
        let newGeometry = geometry.clone(geometry);

        // vertices
        for (let i = 0; i < vertices.count; i++ , nbVertex++) {
            vertex.x = vertices.getX(i);
            vertex.y = vertices.getY(i);
            vertex.z = vertices.getZ(i);

            if (geometry.skinIndexNames === undefined || geometry.skinIndexNames.length === 0) {
                vertex.applyMatrix4(mesh.matrixWorld).applyMatrix4(matrixRotation).applyMatrix4(matrixScale);
                newGeometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
            } else {
                let finalVector = new Vector4();
                let morphVector = new Vector4(vertex.x, vertex.y, vertex.z);

                if (geometry.morphTargetInfluences !== undefined) {
                    let tempMorph = new Vector4();

                    for (let mt = 0; mt < geometry.morphAttributes.position.length; mt++) {
                        if (geometry.morphTargetInfluences[mt] === 0) continue;
                        if (geometry.morphTargetDictionary.hide === mt) continue;

                        let morph = new Vector4(
                            geometry.morphAttributes.position[mt].getX(i),
                            geometry.morphAttributes.position[mt].getY(i),
                            geometry.morphAttributes.position[mt].getZ(i));

                        tempMorph.addScaledVector(morph, geometry.morphTargetInfluences[mt]);
                    }
                    morphVector.add(tempMorph);
                }

                for (let si = 0; si < geometry.skinIndexNames.length; si++) {

                    let skinIndices = geometry.getAttribute([geometry.skinIndexNames[si]])
                    let weights = geometry.getAttribute([geometry.skinWeightNames[si]])

                    let skinIndex = [];
                    skinIndex[0] = skinIndices.getX(i);
                    skinIndex[1] = skinIndices.getY(i);
                    skinIndex[2] = skinIndices.getZ(i);
                    skinIndex[3] = skinIndices.getW(i);

                    let skinWeight = [];
                    skinWeight[0] = weights.getX(i);
                    skinWeight[1] = weights.getY(i);
                    skinWeight[2] = weights.getZ(i);
                    skinWeight[3] = weights.getW(i);

                    let inverses = [];
                    inverses[0] = mesh.skeleton.boneInverses[skinIndex[0]];
                    inverses[1] = mesh.skeleton.boneInverses[skinIndex[1]];
                    inverses[2] = mesh.skeleton.boneInverses[skinIndex[2]];
                    inverses[3] = mesh.skeleton.boneInverses[skinIndex[3]];

                    let skinMatrices = [];
                    skinMatrices[0] = mesh.skeleton.bones[skinIndex[0]].matrixWorld;
                    skinMatrices[1] = mesh.skeleton.bones[skinIndex[1]].matrixWorld;
                    skinMatrices[2] = mesh.skeleton.bones[skinIndex[2]].matrixWorld;
                    skinMatrices[3] = mesh.skeleton.bones[skinIndex[3]].matrixWorld;

                    let tempVector;
                    for (let k = 0; k < 4; k++) {
                        if (geometry.morphTargetInfluences !== undefined) {
                            tempVector = new Vector4(morphVector.x, morphVector.y, morphVector.z);
                        } else {
                            tempVector = new Vector4(vertex.x, vertex.y, vertex.z);
                        }

                        tempVector.multiplyScalar(skinWeight[k]);
                        //the inverse takes the vector into local bone space
                        //which is then transformed to the appropriate world space
                        tempVector.applyMatrix4(inverses[k])
                            .applyMatrix4(skinMatrices[k])
                            .applyMatrix4(matrixRotation).applyMatrix4(matrixScale);
                        finalVector.add(tempVector);
                    }
                }
                newGeometry.attributes.position.setXYZ(i, finalVector.x, finalVector.y, finalVector.z);
            }
        }
        return newGeometry;
    }
};

export {meshProcessor};
