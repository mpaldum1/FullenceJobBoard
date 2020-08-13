import { Component, OnInit, OnDestroy } from '@angular/core';
import { Job } from '../job.model';
import { NgForOf } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { JobsService } from '../job.service';
import { ActivatedRoute, ParamMap } from '@angular/router'; //da znamo da li idemo edit ili create posta, da li je id proslijeđen ili ne
import { mimeType } from './mime-type.validator';
import { LocationService } from 'src/app/location/location.service';
import { Location } from 'src/app/location/location.model';
import { Subscription } from 'rxjs';
import { JobType } from 'src/app/jobs/job-Type/jobType.model';
import { JobTypeService } from 'src/app/jobs/job-Type/jobType.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.css'],
})
export class JobCreateComponent implements OnInit, OnDestroy {
  constructor(
    public jobsService: JobsService,
    public route: ActivatedRoute,
    private locationService: LocationService,
    private jobTypeService: JobTypeService,
    private authService: AuthService
  ) { }

  public filterLocation = '';
  public filterJobType = '';

  locations: Location[] = [];
  private locationsSub: Subscription;
  jobTypes: JobType[] = [];
  private jobTypSub: Subscription;
  private authStatusSub: Subscription;

  private mode = 'create';
  private jobId: string;
  imagePreview: string;
  isLoading = false;
  enteredContent = '';
  enteredTitle = '';
  form: FormGroup;
  job: Job;

  userIsAuthenticated = false;
  userId: string;

  ngOnInit(): void {

    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
      jobType: new FormControl(null, { validators: [Validators.required] }),
      firm: new FormControl(null, { validators: [Validators.required] }),
    });

    //kreiranje svih lokacija
    this.locationService.getLocations();
    this.locationsSub = this.locationService
      .getLocationsUpdatedListener()
      .subscribe((locs: Location[]) => {
        this.locations = locs;
      });

    //kreiranje svih poslova

    this.jobTypeService.getJobTypes();
    this.jobTypSub = this.jobTypeService
      .getJobUpdateListener()
      .subscribe((jobTypes: JobType[]) => {
        this.jobTypes = jobTypes;
      });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.jobId = paramMap.get('postId');
        this.isLoading = true;

        console.log(this.jobsService.getJob(this.jobId));
        this.jobsService.getJob(this.jobId).subscribe((postData) => {
          this.isLoading = false;
          this.job = { id: postData._id, title: postData.title, description: postData.description, imagePath: postData.imagePath, location: postData.location, jobType: postData.jobType, firm: postData.firm, descSubstring: postData.descSubstring, creator: postData.creator };
          this.form.setValue({ title: this.job.title, description: this.job.description, image: this.job.imagePath, location: this.job.location, jobType: this.job.jobType, firm: this.job.firm });

        });
      } else {
        this.mode = 'create';
        this.jobId = null;
      }
    });
  }

  setJobType(jobType) {
    this.job.jobType = jobType;
    console.log(jobType);
  }
  onSavePost() {
    if (this.form.invalid) {
      return;
    }
  
    this.isLoading = true;
    if (this.mode === 'create') {
      this.jobsService.addJob(
        this.form.value.title,
        this.form.value.description,
        this.form.value.image,
        this.form.value.location,
        this.form.value.jobType,
        this.form.value.firm,
        ''

      );
    } else {
      this.jobsService.updateJob(
        this.jobId,
        this.form.value.title,
        this.form.value.description,
        this.form.value.image,
        this.form.value.location,
        this.form.value.jobType,
        this.form.value.firm
      );
    }
    this.form.reset();
  }
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result.toString();
    };
    reader.readAsDataURL(file);
  }
  //podesavanje lokacije posla

  setJobFilter(job) {
    this.filterJobType = job;
  }

  setLocFilter(loc) {
    this.filterLocation = loc;
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
