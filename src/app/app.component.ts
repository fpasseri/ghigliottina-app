import { Component, ViewChild, ViewRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { NgbTypeaheadWindow } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead-window';
import { animate, style, transition, trigger } from '@angular/animations';
import { ignoreElements } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

  animations: [
    trigger('valueAnimation', [
      transition(':increment', [
        style({ color: 'green', fontSize: '50px' }),
        animate('0.8s ease-out', style('*')),
      ]),
      transition(':decrement', [
        style({ color: 'red', fontSize: '50px' }),
        animate('0.8s ease-out', style('*')),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'ghigliottina-app';
  wordCounter = 1;
  jsonData: any;
  soluzione: string = '';
  showWord1: boolean = false;
  showWord2: boolean = false;
  showWord3: boolean = false;
  showWord4: boolean = false;
  showWord5: boolean = false;
  word1 = '';
  word2 = '';
  word3 = '';
  word4 = '';
  word5 = '';
  currentWord = '';
  numeroDomanda: number = 0;
  @ViewChild('cd', { static: false })
  private countdown!: CountdownComponent;
  config: CountdownConfig = { leftTime: 60, notify: 10 };
  notify = '';
  showSolutionPanel = false;
  showWordPanel = false;
  wordChoice: any;
  wordModal: any;
  startModal: any;
  finalModal: any;
  tabelloneModal: any;
  importo = 500000;
  previousWords: Number[] = [];
  win: boolean = false;
  audioMinuto: any;
  audioSottofondo: any;
  audioSigla:any;
  showMenuStart = true;
  showMenuTipoPartita = false;
  showMenuInfo = false;
  showMenuInfo2 = false;
  showMenuNome = false;
  showMenuNome2 = false;
  nome = "";
  nome1 = "";
  nome2 = "";
  round = 0;
  importo1 = 0;
  importo2 = 0;
  arraySolutions = [false,false,false,false,false,false];
  wordIndex = 2;
  goodChoice:boolean = true;

  constructor(private http: HttpClient) {
    this.http.get('assets/domande.json').subscribe((res) => {
      this.jsonData = res;
      this.numeroDomanda = this.randomNumber(0, this.jsonData.parola.length);
      this.previousWords.push(this.numeroDomanda);
      this.wordChoice = this.jsonData.parola[this.numeroDomanda].domande[0];
    });
  }

  randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * max);
  }

  ngOnInit(): void {
    this.startModal = new bootstrap.Modal(
      document.getElementById('startModal'),
      {
        keyboard: false,
        backdrop: 'static'
      }
    );
    this.startModal.show();
    this.playSigla();
  }

  assignWord(counter: number) {
    switch (counter) {
      case 1: {
        this.word1 = this.currentWord;
        this.wordCounter++;
        break;
      }
      case 2: {
        this.word2 = this.currentWord;
        this.showWord2 = true;
        this.wordCounter++;
        break;
      }
      case 3: {
        this.word3 = this.currentWord;
        this.showWord3 = true;
        this.wordCounter++;
        break;
      }
      case 4: {
        this.word4 = this.currentWord;
        this.showWord4 = true;
        this.wordCounter++;
        break;
      }
      case 5: {
        this.word5 = this.currentWord;
        this.showWord5 = true;
        this.wordCounter++;
        this.showWordPanel = false;
        this.showSolutionPanel = true;
        this.playMinuto();
        break;
      }
      default: {
        //statements;
        break;
      }
    }
  }

  checkWord(word: any, obj: any, index: number) {
    this.wordIndex = index;
    if (word.value) {
      this.currentWord = word.choice;
      this.goodChoice = true;
      this.playSuccess();
    } else {
      if (index == 0) {
        this.currentWord = obj[1].choice;
      } else {
        this.currentWord = obj[0].choice;
      }
      this.importo = this.importo / 2;
      this.goodChoice = false;
      this.playError();
    }
    this.assignWord(this.wordCounter);
    setTimeout(() => {
      this.wordModal.hide();
    }, 200);
    if (this.wordCounter < 6) {
      setTimeout(() => {
        this.wordChoice =
          this.jsonData.parola[this.numeroDomanda].domande[
            this.wordCounter - 1
          ];
      }, 200);
    }
  }

  checkSolution() {
    this.countdown.stop();
    if (
      this.soluzione.toUpperCase() ===
      this.jsonData.parola[this.numeroDomanda].solution
    ) {
      this.win = true;
    } else {
      this.win = false;
    }
    if(this.round>0 && this.round<7) {
      if(this.win) {
        if(this.round==1 || this.round==3 || this.round==5) {
          this.importo1 = this.importo1 + this.importo
        }
        if(this.round==2 || this.round==4 || this.round==6) {
          this.importo2 = this.importo2 + this.importo
        }
        this.arraySolutions[this.round-1]=true;
      }
      this.round++;
      if(this.round==7) {
        this.finalModal.hide();
        setTimeout(() => {
          this.openTabellone();
        }, 200);
      }
    } else {
    }
    this.finalModal = new bootstrap.Modal(
      document.getElementById('finalModal'),
      {
        keyboard: false,
        backdrop: 'static'
      }
    );
    this.finalModal.show();

    setTimeout(() => {
      if (this.win) {
        this.playWin();
      } else {
        this.playLoss();
      }
    }, 500);
  }

  ngAfterViewInit(): void {
    this.wordModal = new bootstrap.Modal(document.getElementById('wordModal'), {
      keyboard: false,
    });
  }

  handleEvent(e: any) {
    this.notify = e.action.toUpperCase();
    if (e.action === 'done') {
      this.win = false;
      this.finalModal = new bootstrap.Modal(
        document.getElementById('finalModal'),
        {
          keyboard: false,
          backdrop: 'static'
        }
      );
      this.finalModal.show();
      let audio = new Audio();
      audio.src = './assets/errore.mp3';
      audio.load();
      audio.play();

      if(this.round>0 && this.round<7) {
        this.round++
      }
      if(this.round==7) {
        setTimeout(() => {
        this.finalModal.hide();
          this.openTabellone();
        }, 7000);
      }
    }
  }

  playStart(tipo: Number) {
    if (tipo==1) {
      if (this.nome=='') {
        return;
      }
    }
    if (tipo==2) {
      if (this.nome1=='' || this.nome2=='') {
        return;
      } else {
        this.round = 1;
      }
    }
    this.audioSigla.pause();
    let audio = new Audio();
    audio.src = './assets/start.mp3';
    audio.load();
    audio.play();
    this.startModal.hide();
    this.nuovaPartita();
  }

  playSigla() {
    this.audioSigla = new Audio();
    this.audioSigla.volume = 0.2;
    this.audioSigla.src = './assets/sigla.mp3';
    this.audioSigla.load();
    this.audioSigla.play();
  }

  playMinuto() {
    this.audioSottofondo.pause();
    this.audioMinuto = new Audio();
    this.audioMinuto.src = './assets/minuto.mp3';
    this.audioMinuto.load();
    this.audioMinuto.play();
  }

  playError() {
    let audio = new Audio();
    audio.src = './assets/errata.mp3';
    audio.load();
    audio.play();
  }

  playSuccess() {
    let audio = new Audio();
    audio.src = './assets/esatta.mp3';
    audio.load();
    audio.play();
  }

  playWin() {
    let audio = new Audio();
    this.audioMinuto.pause();
    audio.src = './assets/vincita.mp3';
    audio.load();
    audio.play();
  }

  playLoss() {
    let audio = new Audio();
    this.audioMinuto.pause();
    audio.src = './assets/errore.mp3';
    audio.load();
    audio.play();
  }

  nuovaPartita() {
    this.wordCounter = 1;
    this.soluzione = '';
    this.showWord1 = true;
    this.showWord2 = false;
    this.showWord3 = false;
    this.showWord4 = false;
    this.showWord5 = false;
    this.word1 = '';
    this.word2 = '';
    this.word3 = '';
    this.word4 = '';
    this.word5 = '';
    this.currentWord = '';
    this.notify = '';
    this.showSolutionPanel = false;
    this.showWordPanel = true;
    this.importo = 500000;
    this.win = false;
    this.wordIndex = 2;
    this.goodChoice = true;
    this.audioSottofondo = new Audio();
    this.audioSottofondo.src = './assets/sottofondo.mp3';
    this.audioSottofondo.load();
    this.audioSottofondo.play();
  }

  callNextWord() {
    this.nextWord();
  }

  nextWord() {
    if (this.previousWords.length == this.jsonData.parola.length) {
      this.previousWords = [];
    }
    let number = this.randomNumber(0, this.jsonData.parola.length);
    var trovato = false;
    for (var i = 0; i < this.previousWords.length; i++) {
      if (number == this.previousWords[i]) {
        trovato = true;
        break;
      }
    }
    if (trovato == true) {
      this.nextWord();
    } else {
      this.numeroDomanda = number;
      this.previousWords.push(this.numeroDomanda);
      this.wordChoice = this.jsonData.parola[this.numeroDomanda].domande[0];
      if (this.finalModal) {
        this.finalModal.hide();
      }
      this.nuovaPartita();
    }
  }

  openTabellone() {
    this.tabelloneModal = new bootstrap.Modal(document.getElementById('tabelloneModal'), {
      keyboard: false,
      backdrop: 'static'
    });
    this.tabelloneModal.show();
  }

  restart(modal: Number) {
    if(modal==1) {
      this.finalModal.hide();
      this.tabelloneModal.hide();
      this.showMenuNome = true;
      this.showMenuNome2 = false;
    }

    if(modal==2) {
      this.finalModal.hide();
      if(this.tabelloneModal) {
        this.tabelloneModal.hide();
      }
      this.showMenuNome2 = true;
      this.showMenuNome = false;
    }

    this.wordCounter = 1;
    this.soluzione = '';
    this.showWord1 = true;
    this.showWord2 = false;
    this.showWord3 = false;
    this.showWord4 = false;
    this.showWord5 = false;
    this.word1 = '';
    this.word2 = '';
    this.word3 = '';
    this.word4 = '';
    this.word5 = '';
    this.currentWord = '';
    this.notify = '';
    this.showSolutionPanel = false;
    this.showWordPanel = true;
    this.importo = 500000;
    this.win = false;

    this.startModal = new bootstrap.Modal(
      document.getElementById('startModal'),
      {
        keyboard: false,
        backdrop: 'static'
      }
    );
    this.startModal.show();
  }

  closeTabellone() {
    this.tabelloneModal.hide();
  }
}
