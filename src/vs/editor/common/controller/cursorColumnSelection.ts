/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Selection } from 'vs/editor/common/core/selection';
import { Position } from 'vs/editor/common/core/position';
import { CursorMove, CursorMoveConfiguration, ICursorMoveHelperModel } from 'vs/editor/common/controller/cursorMoveHelper';

export interface IViewColumnSelectResult {
	viewSelections: Selection[];
	reversed: boolean;
}

export class ColumnSelection {
	public static columnSelect(config: CursorMoveConfiguration, model: ICursorMoveHelperModel, fromLineNumber: number, fromVisibleColumn: number, toLineNumber: number, toVisibleColumn: number): IViewColumnSelectResult {
		let lineCount = Math.abs(toLineNumber - fromLineNumber) + 1;
		let reversed = (fromLineNumber > toLineNumber);
		let isRTL = (fromVisibleColumn > toVisibleColumn);
		let isLTR = (fromVisibleColumn < toVisibleColumn);

		let result: Selection[] = [];

		// console.log(`fromVisibleColumn: ${fromVisibleColumn}, toVisibleColumn: ${toVisibleColumn}`);

		for (let i = 0; i < lineCount; i++) {
			let lineNumber = fromLineNumber + (reversed ? -i : i);

			let startColumn = CursorMove.columnFromVisibleColumn2(config, model, lineNumber, fromVisibleColumn);
			let endColumn = CursorMove.columnFromVisibleColumn2(config, model, lineNumber, toVisibleColumn);
			let visibleStartColumn = CursorMove.visibleColumnFromColumn2(config, model, new Position(lineNumber, startColumn));
			let visibleEndColumn = CursorMove.visibleColumnFromColumn2(config, model, new Position(lineNumber, endColumn));

			// console.log(`lineNumber: ${lineNumber}: visibleStartColumn: ${visibleStartColumn}, visibleEndColumn: ${visibleEndColumn}`);

			if (isLTR) {
				if (visibleStartColumn > toVisibleColumn) {
					continue;
				}
				if (visibleEndColumn < fromVisibleColumn) {
					continue;
				}
			}

			if (isRTL) {
				if (visibleEndColumn > fromVisibleColumn) {
					continue;
				}
				if (visibleStartColumn < toVisibleColumn) {
					continue;
				}
			}

			result.push(new Selection(lineNumber, startColumn, lineNumber, endColumn));
		}

		return {
			viewSelections: result,
			reversed: reversed
		};
	}
}
