import { Component, OnInit } from '@angular/core';
import { Tweet } from 'src/app/interfaces/tweet';
import { TweetsService } from 'src/app/services/tweets/tweets.service';
import { UniLoaderService } from 'src/app/shared/uniLoader.service';
import { ToastService } from 'src/app/shared/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';
 
@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.page.html',
  styleUrls: ['./bookmarks.page.scss'],
})
export class BookmarksPage implements OnInit {

  preferiti: Tweet[] = [];

  constructor(
  private tweetsService: TweetsService,
  private auth: AuthService,
  private uniLoader: UniLoaderService,
  private toastService: ToastService
  ) {
    
   }

  async ngOnInit() {

    this.getBookmarks();
  }

  async getBookmarks(){

    try {
    //   console.log(this.auth.me.bookmarks);
        

    //   // Avvio il loader
      this.uniLoader.show();
        // let subtweet : string;
        // Popolo il mio array di oggetti 'Tweet' con quanto restituito dalla chiamata API
        this.preferiti = await this.tweetsService.getTweets();
        

      // La chiamata è andata a buon fine, dunque rimuovo il loader
      this.uniLoader.dismiss(); 

     } catch (err) {

      // Nel caso la chiamata vada in errore, mostro l'errore in un toast
      await this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

     }

  }

  checkbook(tweet){
    if(this.auth.me.bookmarks.includes(tweet._id)){
      console.log("ho trovato il tweet tra i preferiti: " +tweet._id);
      return true;
    }
    else
      return false;
  }

  canEdit(tweet: Tweet): boolean {

    // Controllo che l'autore del tweet coincida col mio utente
    if (tweet._author) {
      return tweet._author._id === this.auth.me._id;
    }

    return false;

  }

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

}
