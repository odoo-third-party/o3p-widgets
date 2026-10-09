from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class O3PWidgetMemory(models.Model):
    _name = "o3p.widget.memory"
    _description = "O3P Widget Memory"

    mtype = fields.Char(
        string="Memory Type", required=True, default="lastnbtab", index=True
    )
    tvalue = fields.Char(string="Text Value", index=True)
    nvalue = fields.Integer(string="Numeric Value")

    @api.depends("mtype")
    def _compute_display_name(self):
        for memory in self:
            memory.display_name = f"{memory.mtype or ''}[{memory.id or 0}]"

    @api.constrains("nvalue")
    def _check_nvalue(self):
        if any(memory.nvalue < 0 for memory in self):
            raise ValidationError(_("Numeric value cannot be negative."))
