import { OnInit } from '@angular/core';
import { HttpService } from 'core/services/http/http.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'core/services/alert/alert.service';
import { Shell } from './shell';


export abstract class BaseEditComponent implements OnInit  {

    constructor(protected route: ActivatedRoute) {}
    model: any = {};
    isNew = true;
    id: string;
    abstract get Service(): HttpService;
    get Alert(): AlertService { return Shell.Injector.get(AlertService); }
    get Route(): Router { return Shell.Injector.get(Router); }

    protected SubmitNew(): Observable<any> {
        return this.Service.postReq('Add', this.model);
    }
    protected SubmitUpdate(): Observable<any> {
        return this.Service.putReq('Update', this.model);
    }
    protected GetModelFromServer(id: any): Observable<any> {
        return this.Service.getHeaderReq('Get', id);
    }

    Submit(): void {
        if (this.isNew) {
            this.SubmitNew().subscribe((data: any) => {
                if(data.status !== 201)
                {
                    this.Alert.showError(data.message);
                    return false;
                }
                this.Alert.showSuccess('تم الاضافة بنجاح');
                this.Redirect();
            }, error => {
                this.Alert.showError('خطا ف الاضافة');
            });
        }
        else {
            this.SubmitUpdate().subscribe((data: any) => {
                this.Alert.showSuccess('تم التعديل بنجاح');
                this.Redirect();
            }, error => {
                this.Alert.showError('خطا ف التعديل');
            });
        }
    }

    getRouteParams() {
        this.route.params.subscribe((p: any) => {
            if (p.id != null && p.id !== undefined) {
                this.isNew = false;
                this.id = p.id;
                this.Get(this.id);
            }
        });
    }

    Redirect() {
        const currentRoute = this.Route.url;
        const index = currentRoute.lastIndexOf('/');
        const str = currentRoute.substring(0, index);
        this.Route.navigate([str]);
    }
    Get(id: any): void {
        this.GetModelFromServer(id).subscribe((data: any) => {
            this.model = data.data;
        }, error => {
            this.Alert.showError('خطأ ف استرجاع البيانات من الخادم')
            console.log(error);
        });
    }

    ngOnInit(): void {
        this.getRouteParams();
    }

}