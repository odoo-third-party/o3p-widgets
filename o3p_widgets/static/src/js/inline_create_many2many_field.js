/** @odoo-module **/

import { makeContext } from "@web/core/context";
import {
    X2ManyField,
    x2ManyField,
} from "@web/views/fields/x2many/x2many_field";
import { registry } from "@web/core/registry";


export class InlineCreateMany2ManyField extends X2ManyField {
    async onAdd({ context, editable } = {}) {
        if (!editable) {
            return super.onAdd(...arguments);
        }

        context = makeContext([this.props.context, context]);
        const editedRecord = this.list.editedRecord;
        if (editedRecord) {
            const pendingChanges = [];
            this.list.model.bus.trigger("NEED_LOCAL_CHANGES", { proms: pendingChanges });
            await Promise.all([...pendingChanges, editedRecord._updatePromise]);
            await this.list.leaveEditMode({ canAbandon: false });
        }
        if (!this.list.editedRecord) {
            return this.addInLine({ context, editable });
        }
    }
}

export const inlineCreateMany2ManyField = {
    ...x2ManyField,
    component: InlineCreateMany2ManyField,
};

registry.category("fields").add("o3p_inline_create_many2many", inlineCreateMany2ManyField);
