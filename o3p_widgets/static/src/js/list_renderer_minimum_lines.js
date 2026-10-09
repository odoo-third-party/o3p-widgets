/** @odoo-module **/

import { session } from "@web/session";
import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";

const NATIVE_MINIMUM_LIST_LINES = 4;
const configuredMinimum = Number(session.o3p_widgets?.minimum_lists_lines);
const minimumListLines =
    Number.isInteger(configuredMinimum) && configuredMinimum >= 0
        ? configuredMinimum
        : NATIVE_MINIMUM_LIST_LINES;

// Keep Odoo's native list renderer completely unchanged for its default of four rows.
if (minimumListLines !== NATIVE_MINIMUM_LIST_LINES) {
    patch(ListRenderer.prototype, {
        get getEmptyRowIds() {
            let emptyRowCount = Math.max(
                0,
                minimumListLines - this.props.list.records.length
            );
            if (emptyRowCount > 0 && this.displayRowCreates) {
                emptyRowCount -= 1;
            }
            return Array.from(Array(emptyRowCount).keys());
        },
    });
}
