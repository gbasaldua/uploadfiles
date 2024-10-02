sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "gbas/developer/uploadfiles/model/models",
    "gbas/developer/uploadfiles/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast, Fragment, UIComponent, Message, library, Model, formatter) {
        "use strict";

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

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
                const oView = this.getView();
                const oMessageManager = sap.ui.getCore().getMessageManager();

                //   Se obtiene la lista de archivos desde el sistema Backend
                Model.setFileListModel(this, fileSetEnityName, 'fileList');

                // Se agrega un nuevo modelo para los mensajes
                oView.setModel(oMessageManager.getMessageModel(), "message");
                // Se registran los mensajes a la vista
                oMessageManager.registerObject(oView, true);
                //   Se reinician los mensajes del log
                sap.ui.getCore().getMessageManager().removeAllMessages();
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

                //   Se reinician los mensajes del log
                sap.ui.getCore().getMessageManager().removeAllMessages();

                if (sStatus === 201) {
                    MessageToast.show("Carga de archivo completada");

                } else {

                    // Error en la carga del archivo
                    const errorDetails = jQuery.parseXML(sResponse).querySelector("errordetails");

                    // Se agregan los mensajes de error al log de la vista
                    if (errorDetails !== null && errorDetails.children.length > 0)
                        this.addErrorMessages(errorDetails.children);

                    MessageBox.error("Error en la carga del archivo");
                }
            },

            addErrorMessages: function (errors) {
                var oMessage, errorType, errorMessage, errorCode;
                for (var j = 0; j < errors.length; j++) {
                    errorType = errors[j].querySelector("severity").textContent;
                    errorMessage = errors[j].querySelector("message").textContent;
                    errorCode = errors[j].querySelector("code").textContent;

                    //   Sólo se muestran los mensajes de error que no sean el mensaje por default
                    // de 'Exception raised without specific error'
                    //if (errorType === 'error' && errorCode !== '/IWBEP/CX_MGW_BUSI_EXCEPTION') {
                    oMessage = new Message({
                        message: errorMessage,
                        type: MessageType.Error,
                        processor: this.getView().getModel()
                    });

                    sap.ui.getCore().getMessageManager().addMessages(oMessage);
                    //}
                }
            },

            onDownloadFile: function () {
                const oItem = this.getView().byId("idFilesTable").getSelectedItem();
                const oFile = oItem.getBindingContext('fileList').getObject();
                const oBusy = new sap.m.BusyDialog();
                const uriFileValue = Model.createFileUri('/FileSet', oFile.Id);
                var oModelFileSet = new sap.ui.model.odata.ODataModel(
                    this.getOwnerComponent().getModel().sServiceUrl
                );


                //   Se agrega un parámetro header custom
                oModelFileSet.setHeaders({
                    "id_po": "2000000098"
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
                    error: function () {
                        oBusy.close();
                        alert('Error en la descarga');
                    }
                });
            },

            onMessageDetails: function (oEvent) {
                var oSourceControl = oEvent.getSource();
                this._getMessagePopover().then(function (oMessagePopover) {
                    oMessagePopover.openBy(oSourceControl);
                });
            },

            _getMessagePopover: function () {
                var oView = this.getView();
                // create popover lazily (singleton)
                if (!this._pMessagePopover) {
                    this._pMessagePopover = Fragment.load({
                        id: oView.getId(),
                        name: "gbas.developer.uploadfiles.fragment.MessagePopover"
                    }).then(function (oMessagePopover) {
                        oView.addDependent(oMessagePopover);
                        return oMessagePopover;
                    });
                }
                return this._pMessagePopover;
            },
        });
    });
