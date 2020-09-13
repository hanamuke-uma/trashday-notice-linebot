// LINE developersのメッセージ送受信設定に記載のアクセストークン
let ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("TOKEN");
//現在時刻を獲得
let today = Moment.moment().format("ddd MMM DD YYYY");
//シート情報を獲得
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getActiveSheet();
//シートの配列を獲得
var range = sheet.getDataRange();
var values = range.getValues();


//ごみの日を通知する
function notice(){
  //pushメッセージで送るための準備
  var pushUrl = 'https://api.line.me/v2/bot/message/push';
  var to = PropertiesService.getScriptProperties().getProperty('TO');
  
  //送るテキストを決定
  if(values[getKind()][1] == '収集なし'){
    messages = [{'type': 'text', 'text': '今日の収集はありません'}];
  }else{
    messages = [{"type": "template", "altText": "今日は"+ values[getKind()][1] +"ごみの日です．出しましたか？", "template": {"type": "buttons", "text": "今日は"+ values[getKind()][1] +"ごみの日です．出しましたか？", "actions": [{"type": "postback", "label": "はい", "data": "yes", "displayText": "はい"}, {"type": "postback", "label": "いいえ", "data": "no", "displayText": "いいえ"}]}}];
  }
  
  //送る動作
  UrlFetchApp.fetch(pushUrl, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'muteHttpExceptions': true,
    'payload': JSON.stringify({
      'to': to, 
      'messages': messages
    })
    });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

//ポストバックイベント
function doPost(e) {
  // ユーザーのメッセージを取得
  var userMessage = JSON.parse(e.postData.getDataAsString()).events[0];
  // 応答メッセージ用のAPI URL
  var url = 'https://api.line.me/v2/bot/message/reply';
  Logger.log(userMessage);
  
  if(userMessage.type == 'postback'){
    let dat = userMessage.postback.data;
    if(dat == 'yes'){
      repMessage = [{'type': 'text', 'text': 'えらい！'}];
    }else{
      repMessage = [{'type': 'text', 'text': 'いつか出せるのでヨシ！'}];
    }
  }else{
    repMessage = [{'type': 'text', 'text': userMessage.message.text}];
  }
  
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': userMessage.replyToken,
      'messages': repMessage
    })
    });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}


//ごみの種類を判別
function getKind(){
  //todayに対応する行を獲得
  for(var i=1;i<values.length;i++){
    if(values[i][0] == today + ' 00:00:00 GMT+0900 (Japan Standard Time)'){
      return i;
      break;
    }
  }
}

