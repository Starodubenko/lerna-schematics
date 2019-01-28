import {chain, externalSchematic, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getWorkspace} from "@schematics/angular/utility/config";

const licenseText = `
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
`;

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function myComponent(options: any): Rule {

    return chain([
        (_tree: Tree, _context: SchematicContext) => {
            setupOptions(_tree, options);
            return _tree;
        },
        externalSchematic('@schematics/angular', 'component', options),
        (tree: Tree, _context: SchematicContext) => {
            // console.log('started custom rule: ', tree);
            // console.log('options.sourceDir: ', options);
            tree.getDir(options.path)
                .visit(filePath => {
                    // console.log('path: ' + filePath);
                    if (!filePath.endsWith('.ts')) {
                        return;
                    }

                    // console.log('is TS file: ' + filePath.endsWith('.ts'));
                    const content = tree.read(filePath);
                    if (!content) {
                        return;
                    }

                    // console.log('has hontent: ' + content);
                    // Prevent from writing license to files that already have one.
                    if (content.indexOf(licenseText) == -1) {
                        // console.log('Write licence text');
                        tree.overwrite(filePath, licenseText + content);
                    }
                });
            return tree;
        },
    ]);
}

// @ts-ignore
function setupOptions(host: Tree, options: any): Tree {
    const workspace = getWorkspace(host);
    if (!options.project) {
        options.project = Object.keys(workspace.projects)[0];
    }

    options.path = getPath(options);
}

function getPath(options: any) {
    const currentPath = (process.env.PWD as string);

    return currentPath
        .substr(
            currentPath.indexOf(options.project) + options.project.length,
            currentPath.length
        );
}
