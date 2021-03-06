import { Component, OnInit } from '@angular/core';
import { Tweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { ModalController } from '@ionic/angular';
import { NewTweetPage } from '../new-tweet/new-tweet.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
import { CommentPage } from 'src/app/pages/comment/comment.page';
import { TweetDetailPage } from 'src/app/pages/tweet-detail/tweet-detail.page';
import { NavController } from '@ionic/angular';
import { UsersService } from 'src/app/services/users/users.service';


@Component({
  selector: 'app-tweets',
  templateUrl: './tweets.page.html',
  styleUrls: ['./tweets.page.scss'],
})
export class TweetsPage implements OnInit {

  tweets: Tweet[] = [];

  constructor(
    private tweetsService: TweetsService,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private uniLoader: UniLoaderService,
    private toastService: ToastService,
    private navCtrl: NavController,
    private userService: UsersService
  ) { }

  async ngOnInit() {

    // Quando carico la pagina, riempio il mio array di Tweets
    await this.getTweets();

  }

  async getTweets() {

    try {

      // Avvio il loader
      await this.uniLoader.show();

      // Popolo il mio array di oggetti 'Tweet' con quanto restituito dalla chiamata API
      //this.tweets = await this.tweetsService.getTweets();
      this.tweets = await this.tweetsService.getParentTweets('0');

      // La chiamata è andata a buon fine, dunque rimuovo il loader
      await this.uniLoader.dismiss();

    } catch (err) {

      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

  }

   /*Handle hashtags */
   private hashtagsList:string[];



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
      await this.getTweets();

      // La chiamata è andata a buon fine, dunque rimuovo il loader
      await this.uniLoader.dismiss();

    });

    // Visualizzo la modal
    return await modal.present();

  }

  async deleteTweet(tweet: Tweet) {

    try {

      // Mostro il loader
      await this.uniLoader.show();

      // Cancello il mio tweet
      await this.tweetsService.deleteTweet(tweet._id);

      // Riaggiorno la mia lista di tweets
      await this.getTweets();

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

  canEdit(tweet: Tweet): boolean {

    // Controllo che l'autore del tweet coincida col mio utente
    if (tweet._author) {
      return tweet._author._id === this.auth.me._id;
    }

    return false;

  }

// storia3
async books(tweet: Tweet){
  if(this.auth.me.bookmarks.includes(tweet._id)){ //se lo trova lo rimuovo
  for( var i = 0; i < this.auth.me.bookmarks.length; i++){ 
    if ( this.auth.me.bookmarks[i] === tweet._id) {
      this.auth.me.bookmarks.splice(i, 1); 
    }
 }
}else{ //lo aggiungo
  this.auth.me.bookmarks.push(tweet._id);
}
//aggiorna il db
await this.userService.editUser(this.auth.me);
}


  preferred(tweet: Tweet): boolean{
    //console.log(tweet._id);
  
    if(this.auth.me.bookmarks.includes(tweet._id))
      return true;
    else
      return false;
  }
// fine modifiche storia3

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

  //Create a comment
  async createComment(tweet: Tweet){
    //Create a modal to comment the tweet
    const modal = await this.modalCtrl.create({
      component: CommentPage,
      componentProps: {tweet}
    });
    return modal.present();
    
  }
  /*Handles tweet likes*/

  

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

  async showTweetDetail(tweet: Tweet){
    //Create a modal to comment the tweet
    const detailmodal = await this.modalCtrl.create({
      component: TweetDetailPage,
      componentProps: {tweet}
    });

    detailmodal.onDidDismiss()
    .then(async () => {
  
      // Aggiorno la mia lista di tweet, per importare le ultime modifiche apportate dall'utente
      await this.getTweets();
  
      // La chiamata è andata a buon fine, dunque rimuovo il loader
      await this.uniLoader.dismiss();
  
    });
  
    // Visualizzo la modal
    return await detailmodal.present();  
  }


  isLiked(tweet:Tweet){
    var user = tweet.like_user_list.find(x => x == this.auth.me._id);
    if(user != undefined){
      
      return true;
      
    }
    else{
      return false;
      
    }
  }
 

  // SEARCH BAR
  getItems(ev: any) {
    // set val to the value of the searchbar
    for(let i = 0; i <  this.tweets.length; i++){
      this.tweets[i].hashtags = (this.tweets[i].tweet.split(' ').filter(v=> v.startsWith('#')));
      
      console.log(this.tweets[i].hashtags);
    }
    console.log("PROVA: "+this.tweets);
    let val :string= ev.target.value;

    // if the value is an empty string don't filter the items
    
    if (val) {
      if(val.startsWith("#")){
        val=val;
      }else{
        val="#"+val;
      }

    this.tweets=this.tweets.filter((t)=>{
        for(let i =0;i<t.hashtags.length;i++){
          if(t.hashtags[i].toLowerCase().startsWith(val.toLowerCase())){
            return t;
          }
        }
    })

    } else{
      return this.getTweets();
    }
  }

  addHashtagsToClass(){
    for(let i = 0; i < this.tweets.length; i++){
      if(this.tweets[i].tweet.includes("#")){
        let tmp:any = (this.tweets[i].tweet.split(' ').filter(v=> v.startsWith('#')));
        tmp.setAttribute("class","hashtag");
        console.log(this.tweets[i].tweet.split(' ').filter(v=> v.startsWith('#')));
      }
    }
  }

}
