import { Component, OnInit, Input } from '@angular/core';
import { Tweet, NewTweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { ModalController, NavParams } from '@ionic/angular';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { NewTweetPage } from '../new-tweet/new-tweet.page';
 

@Component({
  selector: 'app-tweet-detail',
  templateUrl: './tweet-detail.page.html',
  styleUrls: ['./tweet-detail.page.scss'],
})
export class TweetDetailPage implements OnInit {

  private tweet: Tweet;
  private childTweets: Tweet[] = [];

  constructor(
    private tweetsService: TweetsService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private toastService: ToastService,
    private auth: AuthService,
    private uniLoader: UniLoaderService
    ) { 
  }

  async ngOnInit() {
      this.tweet = this.navParams.get('tweet');
      await this.getChildTweetList();
  }


  async dismiss() {
    await this.modalCtrl.dismiss();
  }


  async getChildTweetList(){

      try {
        await this.uniLoader.show();
        //console.log("Recupero i parent");
        this.childTweets = await this.tweetsService.getParentTweets(this.tweet._id);
        //console.log("Parent"+this.childTweets);
        await this.uniLoader.dismiss();
      }catch (err) {

          // Nel caso la chiamata vada in errore, mostro l'errore in un toast
          await this.toastService.show({
            message: err.message,
            type: ToastTypes.ERROR
          });
      }
  }

  canEdit(tweet: Tweet): boolean {

    // Controllo che l'autore del tweet coincida col mio utente
    if (tweet._author) {
      return tweet._author._id === this.auth.me._id;
    }

    return false;

  }

  // Metodo bindato con l'interfaccia in Angular
  getAuthor(tweet: Tweet): string {

    if (this.canEdit(tweet)) {
      return 'You';
    } else {
      return tweet._author.name + ' ' + tweet._author.surname;
    }

    /* ------- UNA FORMA PIÚ SINTETICA PER SCRIVERE STA FUNZIONE: -------

      return this.canEdit(tweet) ? 'You' : `${tweet._author.name} ${tweet._author.surname}`;

    */

  }

  async showTweetDetail(tweet: Tweet){
    //Create a modal to comment the tweet
    const detailmodal = await this.modalCtrl.create({
      component: TweetDetailPage,
      componentProps: {tweet}
    });

    detailmodal.onDidDismiss()
    .then(async () => {
    
    });
  
    // Visualizzo la modal
    return await detailmodal.present();  
  }

  formatDate(value: string){
      let timeDiff: number = 1;

      const date = new Date(value);
  
      const day = '0' + date.getDate();
      const month = '0' + date.getMonth();
      const year = date.getFullYear();
      const hour = '0' + (date.getHours() + timeDiff);
      const minute = '0' + date.getMinutes();
  
      return day.slice(-2) + '-' +
        month.slice(-2) + '-' +
        year + ' ' +
        hour.slice(-2) + ':' +
        minute.slice(-2);
  }



  async deleteTweet(tweet: Tweet) {

    try {

      // Mostro il loader
      await this.uniLoader.show();

      // Cancello il mio tweet
      await this.tweetsService.deleteTweet(tweet._id);

      // Riaggiorno la mia lista di tweets
      await this.getChildTweetList();

      // Mostro un toast di conferma
      await this.toastService.show({
        message: 'Your tweet was deleted successfully!',
        type: ToastTypes.SUCCESS
      });

    } catch (err) {

      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

    // Chiudo il loader
    await this.uniLoader.dismiss();

  }


  async createOrEditTweet(tweet?: Tweet) {

    /*
        Creo una modal (assegnandola ad una variabile)
        per permettere all'utente di scrivere un nuovo tweet
    */
    const modal = await this.modalCtrl.create({
      component: NewTweetPage,
      componentProps: {
        tweet
      } // Passo il parametro tweet. Se non disponibile, rimane undefined.
    });

    /*
        Quando l'utente chiude la modal ( modal.onDidDismiss() ),
        aggiorno il mio array di tweets
    */
    modal.onDidDismiss()
    .then(async () => {

      // Aggiorno la mia lista di tweet, per importare le ultime modifiche apportate dall'utente
      await this.getChildTweetList();

      // La chiamata è andata a buon fine, dunque rimuovo il loader
      await this.uniLoader.dismiss();

    });

    // Visualizzo la modal
    return await modal.present();

  }

  /*
  async likeTweet(tweet:Tweet){
    this.tweetsService.likeTweet(tweet._id,this.auth.me._id);
    var user = tweet.like_user_list.find(x => x == this.auth.me._id);
    if(user != undefined){
      var index = tweet.like_user_list.findIndex(x => x == this.auth.me._id);
      tweet.like_user_list.splice(index,1);
      
    }
    else{
      tweet.like_user_list.push(this.auth.me._id);
      
    }
    
    console.log("Current user: "+this.auth.me._id);
  }
  */


}
