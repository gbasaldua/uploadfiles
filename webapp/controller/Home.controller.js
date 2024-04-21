sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "gbas/developer/uploadfiles/model/models",
    "gbas/developer/uploadfiles/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, Model, formatter) {
        "use strict";

        return Controller.extend("gbas.developer.uploadfiles.controller.Home", {

            formatter: formatter,

            onInit: function () {
                var oRouter = UIComponent.getRouterFor(this);

                //   Se actualizan los datos de la lista de pedidos
                oRouter.getRoute("RouteHome").attachPatternMatched(this.onRouteMatched, this);
            },

            onRouteMatched: function () {

                //   Se obtiene y carga la información de la vista
                this.getViewData();
            },

            getViewData: function () {
                const uriFileSet = this.getOwnerComponent().getModel().sServiceUrl + '/FileSet';
                const oModelFiles = Model.createFilesModel(uriFileSet);


                //   Se actualiza el modelo de archivos
                this.getView().setModel(oModelFiles, 'fileList');
            },

            onRefresh: function () {
                const oInitModel = new sap.ui.model.json.JSONModel();

                //   Se Inicializa el modelo de datos de la vista
                this.getView().setModel(oInitModel, 'fileList');

                //   Se obtiene y carga la información de la vista
                this.getViewData();
            },

            onDownload: function () {
                const oItem= this.getView().byId("idFilesTable").getSelectedItem();
                const oFile = oItem.getBindingContext("fileList").getObject();

                const oBusy = new sap.m.BusyDialog();
                const uriFileValue = Model.createFileUri('/FileSet', oFile.Id);
                var oModelFileSet = new sap.ui.model.odata.ODataModel(
                    this.getOwnerComponent().getModel().sServiceUrl
                );

                oBusy.open();

                //   Se realiza el llamado a la uri de descarga del archivo
                oModelFileSet.read(uriFileValue, {
                    success: function (oData, response) {
                        const file = response.requestUri;
                        oBusy.close();

                        //   Se realiza la descarga del documento
                        window.open(file);
                    },
                    error: function() {
                        oBusy.close();
                        alert('Error en la descarga');
                    }
                });
            }
        });
    });
