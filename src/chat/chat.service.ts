/* eslint-disable prettier/prettier */
import { Body, Injectable} from "@nestjs/common";

/*
 * @Date : 2024.01.03 (수)
 * @Author : osm    
 * @Function : 욕설 필터링 비즈니스 로직
 * @Parm : 문자   
 * @Explain : 클린봇, 채팅창에서 불쾌한 단어 입력 시 ***로 필터링
 */


@Injectable()
export class ChatService {
  
  private profanityList: string[] = ['씨발','씨발년','씨바', '개새끼','개새','개세', '십새','씹새', 'fuck', '뻑큐', '뻐큐','뻑유', '뻨', '펔', '펔유' ]
  private filteredText :string
  cleanBotAction(text:string) {
    this.profanityList;
    this.filteredText = text; //초기 값 설정 필수!
    this.profanityList.forEach((profanity) => {

      // /'씨발'/gi
      const regEx = new RegExp(profanity, 'gi'); //g:모든 패턴에대한 전역 검색 + i:대/소문자 구분x
      this.filteredText = this.filteredText.replace(regEx, '***')
      //console.log(this.filteredText)

      
    });
    console.log(this.filteredText);
    return this.filteredText;
  }
  checkProfanity(filteredMessage:string) {
    const result = new RegExp(/\*\*\*/gi).test(filteredMessage);
    return result;
  }
  
  
  //#폭탄 메시지 방지: 채팅의 길이가 30 얼마 이상 넘어가면 삭제:  [].
  chattingManagement(@Body() msgArr:string[]){
    return msgArr;
    /*
    if(msgArr.length >= 10) {
      return msgArr.slice(4)
    } else  {
      return msgArr
    }
    */
  }
}