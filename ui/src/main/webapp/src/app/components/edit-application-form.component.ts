import {Component, OnInit, Renderer, NgZone} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {FileUploader} from "ng2-file-upload/ng2-file-upload";
import {RegisteredApplication} from "../windup-services";
import {RegisteredApplicationService} from "../services/registered-application.service";
import {FileExistsValidator} from "../validators/file-exists.validator";
import {FileService} from "../services/file.service";
import {ApplicationGroupService} from "../services/application-group.service";
import {Constants} from "../constants";
import {RegisterApplicationFormComponent} from "./register-application-form.component";

@Component({
    templateUrl: 'register-application-form.component.html'
})
export class EditApplicationFormComponent extends RegisterApplicationFormComponent implements OnInit {
    application: RegisteredApplication;
    multipartUploader: FileUploader;

    constructor(
        _router:Router,
        _activatedRoute: ActivatedRoute,
        _fileService:FileService,
        _registeredApplicationService:RegisteredApplicationService,
        _formBuilder: FormBuilder
    ) {
        super(_router, _activatedRoute, _fileService, _registeredApplicationService, _formBuilder);
        this.multipartUploader = _registeredApplicationService.getMultipartUploader();
    }

    ngOnInit():any {
        this.isMultiple = false;

        this.labels = {
            heading: 'Update application',
            submitButton: 'Update'
        };

        this.registrationForm = this._formBuilder.group({
            inputPath: ["", Validators.compose([Validators.required, Validators.minLength(4)]), FileExistsValidator.create(this._fileService)]
        });

        this._activatedRoute.data.subscribe((data: {application: RegisteredApplication}) => {
            this.application = data.application;
            this.mode = this.application.registrationType;
            this.fileInputPath = this.application.inputPath;
            this.multipartUploader.setOptions({
                url: Constants.REST_BASE + RegisteredApplicationService.REGISTERED_APPLICATION_SERVICE_NAME + this.application.id,
                disableMultipart: false,
                method: 'PUT'
            });
        });
    }

    register() {
        if (this.mode == "PATH") {
            this.application.inputPath = this.fileInputPath;
            this._registeredApplicationService.update(this.application).subscribe(
                application => this.rerouteToApplicationList(),
                error => this.handleError(<any>error)
            );
        } else {
            if (this.multipartUploader.getNotUploadedItems().length > 0) {
                this._registeredApplicationService.updateByUpload(this.application).subscribe(
                    application => this.rerouteToApplicationList(),
                    error => this.handleError(<any>error)
                );
            } else {
                this.handleError("Please select file first");
            }
        }
        return false;
    }
}
