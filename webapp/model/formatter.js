sap.ui.define([
], function () {
    'use strict';
    return {
        formatDate: function (value) {
            var oType = new sap.ui.model.type.Date({ source: { pattern: "yyyy-MM-dd" }, style: "medium" });
            console.log('fecha: ', value);
            //   En caso que la fecha venga vacía se devuelve null
            if (value === "0000-00-00")
                return null;
            //   Se crea el texto con el tipo fecha y el formato de origen yyyy-MM-dd
            var oText = new sap.m.Text({
                text: {
                    value: value,
                    type: oType
                }
            })
            return oText.getText();
        },
    };
});