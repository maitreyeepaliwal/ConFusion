import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import {NgForm} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
})

export class DishdetailComponent implements OnInit {

  @ViewChild('fform') commentFormDirective!: NgForm;;
  commentForm!: FormGroup;
  comment!: Comment;

  dish!: Dish;
  dishIds!: string[];
  prev!: string;
  next!: string;
  copy!: Dish;
  errMess!: string;
  dishcopy!: Dish;
  visibility = 'shown';

  formErrors : any = {
    'author': '',
    'rating': '',
    'comment': '',
  };

  validationMessages : any = {
    'author': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.'
    },
    'comment': {
      'required':      'Last Name is required.'
    },
  };

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required] ],
      rating: 5,
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)] ],

    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

  this.onValueChanged(); // (re)set validation messages now
  }

  onSubmit() {
    let date = new Date().toISOString();
    this.comment = this.commentForm.value;
    this.commentForm.value.date = date;
    this.comment = this.commentForm.value;
    this.dishcopy.comments.push(this.comment);
  
    this.dishservice.putDish(this.dishcopy)
    .subscribe({next:dish => {
      this.dish = dish;
      this.dishcopy = dish;
    },
    error: errmess =>{ this.dish=null!; this.dishcopy=null!; this.errMess=<any>errmess;
    }} );

  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location, 
    private fb: FormBuilder, 
    @Inject('BaseURL') public BaseURL : string ) { 
      this.createForm();
    }

  ngOnInit() {
    /* let id = this.route.snapshot.params['id'];
    this.dishservice.getDish(id).subscribe(dish => this.dish = dish); */

    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
    .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
      .subscribe({next: (dish) => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id);  this.visibility = 'shown';},
        error: errmess => this.errMess = <any>errmess} );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
