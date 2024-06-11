sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "gbas/developer/uploadfiles/model/models",
    "gbas/developer/uploadfiles/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox,  MessageToast, UIComponent, Model, formatter) {
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
                const fileSetEnityName = '/FileSet';

                //   Se obtiene la lista de archivos desde el sistema Backend
                Model.setFileListModel(this, fileSetEnityName, 'fileList');
            },

            onRefresh: function () {
                const oInitModel = new sap.ui.model.json.JSONModel();

                //   Se Inicializa el modelo de datos de la vista
                this.getView().setModel(oInitModel, 'fileList');

                //   Se obtiene y carga la información de la vista
                this.getViewData();
            },

            onUploadFile: function () {
                const uriFileSet = this.getOwnerComponent().getModel().sServiceUrl + '/FileSet';
                const csrfToken = this.getView().getModel().getSecurityToken();
                var oFileUploader = this.getView().byId("idFileUploader");
                oFileUploader.setSendXHR(true);
                //   Se establece la Url del servicio de Upload del Archivo
                oFileUploader.setUploadUrl(uriFileSet);
                //   Token para el método POST del archivo del proyecto
                var oCustomerHeaderToken = new sap.ui.unified.FileUploaderParameter({
                    name: "x-csrf-token",
                    value: csrfToken
                });
                //   Nombre del archivo a subir
                var oSlug = new sap.ui.unified.FileUploaderParameter({
                    name: "slug",
                    value: oFileUploader.getValue()
                });
                //   Se agregar los parámetros del header del request
                oFileUploader.addHeaderParameter(oCustomerHeaderToken);
                oFileUploader.addHeaderParameter(oSlug);
                //   Se realiza el upload del archivo
                oFileUploader.checkFileReadable().then(function () {
                    oFileUploader.upload();
                    oFileUploader.destroyHeaderParameters();
                }, function (error) {
                    MessageToast.show("Error en la lectura del archivo");
                }).then(function () {
                    oFileUploader.clear();
                });

            },

            onUploadComplete: function (oEvent) {
                const sStatus = oEvent.getParameter("status");
                var sResponse = oEvent.getParameter("responseRaw");

                if (sStatus === 201) {
                    MessageToast.show("Carga de archivo completada");

                } else {
                    const errorDetails = jQuery.parseXML(sResponse).querySelector("errordetails");
                    
                    if (errorDetails !== null) {

                        const errorMsg = errorDetails.querySelector("message").textContent;
                        MessageBox.error(errorMsg);
                    } else
                        MessageBox.error("Error en la carga del archivo");
                }
            },

            onDownloadFile: function () {
                const oItem= this.getView().byId("idFilesTable").getSelectedItem();
                //const oFile = oItem.getBindingContext("fileList").getObject();
                const oFile = oItem.getBindingContext().getObject();

                const oBusy = new sap.m.BusyDialog();
                const uriFileValue = Model.createFileUri('/FileSet', oFile.Id);
                var oModelFileSet = new sap.ui.model.odata.ODataModel(
                    this.getOwnerComponent().getModel().sServiceUrl
                );


                //   Se agrega un parámetro header custom
                oModelFileSet.setHeaders({
                    "id_po" : "2000000098"
                });

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
