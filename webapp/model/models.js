sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            createFilesModel: function (serviceUrl) {
                var oModel = new sap.ui.model.json.JSONModel();
                const oBusy = new sap.m.BusyDialog();

                oBusy.open();

                oModel.loadData(serviceUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusy.close();
                });

                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            setFileListModel: function (oThis, entityName, modelName) {
                const oBusy = new sap.m.BusyDialog();
                var oFileSetModel = new sap.ui.model.json.JSONModel();
                var oDataModel = new sap.ui.model.odata.ODataModel(
                    oThis.getOwnerComponent().getModel().sServiceUrl
                );

                oBusy.open();

                //   Se realiza el llamado para la obtención de la lista de archivos
                oDataModel.read(entityName, {
                    success: function (oData, response) {

                        oBusy.close();

                        //   Se realiza el binding con el modelo de la vista
                        oFileSetModel.setData(oData);
                        oThis.getView().setModel(oFileSetModel, modelName);

                    },
                    error: function() {
                        oBusy.close();
                        alert('Error en la conexión con SAP');
                    }
                });
            },

            createFileUri: function (serviceUrl, fileId) {
                const uriFileSet = serviceUrl + "('" + fileId + "')/$value";
                return uriFileSet;
            }
        };
    });