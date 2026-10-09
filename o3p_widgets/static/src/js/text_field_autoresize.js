/** @odoo-module **/

import { session } from "@web/session";
import { patch } from "@web/core/utils/patch";
import { TextField, textField } from "@web/views/fields/text/text_field";

const NATIVE_MINIMUM_TEXT_LINES = 2;
const TEXT_LINE_HEIGHT = 25;
const configuredMinimum = Number(session.o3p_widgets?.minimum_text_lines);
const minimumTextLines =
    Number.isInteger(configuredMinimum) && configuredMinimum >= 1
        ? configuredMinimum
        : NATIVE_MINIMUM_TEXT_LINES;

// Keep Odoo's native text field completely unchanged for its default of two lines.
if (minimumTextLines !== NATIVE_MINIMUM_TEXT_LINES) {
    const originalExtractProps = textField.extractProps;
    textField.extractProps = (params, ...args) => {
        const props = originalExtractProps(params, ...args);
        if (!params.attrs?.rows) {
            props.rowCount = minimumTextLines;
        }
        return props;
    };

    patch(TextField.prototype, {
        get minimumHeight() {
            return this.props.lineBreaks ? minimumTextLines * TEXT_LINE_HEIGHT : 0;
        },
    });
}
