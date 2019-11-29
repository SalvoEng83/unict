import { Component, OnInit, Input } from '@angular/core';
import { Tweet, NewTweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { ModalController, NavParams } from '@ionic/angular';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {

  constructor(
    private tweetsService: TweetsService,
    private navParams: NavParams,
    private modalCtrl: ModalController
    ) {
      
   }

  ngOnInit() {
    this.masterTweet = this.navParams.get('tweet');
  }

  

  testo:string;
  masterTweet: Tweet;


  

  

  addComment(){
    /*
    const parent_id:string = this.masterTweet._id;
    this.comment.parent_id = parent_id;
    this.comment.tweet = this.textarea;
    */
    const comment = <NewTweet>{
      tweet: this.testo,
      parent_id: this.masterTweet._id
    }
  
    this.tweetsService.createTweet(comment);
    console.log("Tweet id: "+ this.masterTweet._id);
    console.log(this.testo);
    console.log("Parent Id: "+comment.parent_id);
    this.dismiss();
  }


  async dismiss() {

    await this.modalCtrl.dismiss();

  }

}
