# GreenFinch JavaScript Library
![](https://upload.wikimedia.org/wikipedia/commons/3/32/Carduelis_chloris_3_%28Marek_Szczepanek%29.jpg)

한국신용데이터 data lake로 서비스 내 각종 event를 전송하는 javascript library 입니다. 

## 설치하기
아래 2가지 방법을 지원합니다. 서비스 환경에 맞는 방법으로 설치하시기 바랍니다.
### NPM으로 설치하기
```sh
npm install --save greenfinch
```

라이브러리 설치 후 발급받은 토큰와 서비스명으로 init후 track 호출로 이벤트 전송

```javascript
import greenfinch from 'greenfinch';

greenfinch.init('<YOUR TOKEN>', {'service_name': '<YOUR SERVICE>', 'debug':true});
greenfinch.track("An event");
```

### Javascript snippet으로 설치하기
아래 snippet을 발급받은 토큰와 서비스명으로 치환 후 `<head></head>` 사이에 붙어넣기
```html
<script>window.GREENFINCH_CUSTOM_LIB_URL = 'https://asset.kcd.co.kr/js/greenfinch.min.js';</script>
<script src="https://asset.kcd.co.kr/js/greenfinch-jslib-snippet.min.js"></script>
<script type="text/javascript">greenfinch.init("<YOUR TOKEN>", {'service_name':'<YOUR SERVICE>', 'debug': true});</script>
```

## 기능
### autotrack
- page load시 pageview 이벤트가 자동으로 전송
- dom click시 click 이벤트가 자동으로 전송

### single page application
- spa에서는 경로 변경 시 page load가 일어나지 않기 때문에 pageview 이벤트를 자동 전송하려면 page 변경 listener에 아래 코드 추가 필요
```javascript
greenfinch.page();
```

### 기본 수집 컬럼
- browser_name
- browser_version
- current_url
- host
- referrer
- insert_id(unique_id)
- lib_version
- os
- pathname
- screen_height
- screen_width
- title
- session_id
- time
- utm_source, utm_medium, utm_campaign, utm_content, utm_term

## 사용하기
___
### greenfinch.init
greenfinch object를 초기화 하는 함수입니다. 아래와 같이 초기화 후 사용하시기 바랍니다.

```javascript
greenfinch.init('<YOUR TOKEN>', {'service_name': '<YOUR SERVICE>', 'debug':true or false});
```

| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **token** | <span class="mp-arg-type">String, </span></br></span><span class="mp-arg-required">required</span> | 부여받은 token |
| **config** | <span class="mp-arg-type">Object, </span></br></span><span class="mp-arg-required">required</span> | 초기화 시 필요한 config|
| **options.service_name** | <span class="mp-arg-type">String, </span></br></span><span class="mp-arg-required">required</span> | 부여받은 service name |
| **options.debug** | <span class="mp-arg-type">Boolean, </span></br></span><span class="mp-arg-required">required</span> | true: staging, false: production |


___
### greenfinch.track
custom한 event를 전송하는 함수입니다.


```javascript
greenfinch.track('Registered', {'Gender': 'Male', 'Age': 21});
```

| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **event_name** | <span class="mp-arg-type">String, </span></br></span><span class="mp-arg-required">required</span> | 이벤트 이름 |
| **properties** | <span class="mp-arg-type">Object, </span></br></span><span class="mp-arg-optional">optional</span> | 추가적으로 전송할 properties |

___
### greenfinch.page
pageview event를 전송하는 함수입니다.
single page application에서 경로 변경 시 호출되는 listener에 추가하시면 됩니다. 

```javascript
greenfinch.page();
```

___
### greenfinch.register
super properties를 등록하는 함수입니다. 등록 이후 track되는 모든 event에 해당 properties가 추가됩니다. 로그인 성공 직후 유저 정보를 설정하는데 활용 가능합니다. 

```javascript
greenfinch.register({'user_id': 123456});
```


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **properties** | <span class="mp-arg-type">Object, </span></br></span><span class="mp-arg-required">required</span> | 저장하려고 하는 properties |

___
### greenfinch.unregister
super property에 저장되어 있는 항목을 제거하는 함수입니다. 로그아웃 후 유저 정보를 삭제하는데 활용 가능합니다.

```javascript
greenfinch.unregister('user_id');
```


| Argument | Type | Description |
| ------------- | ------------- | ----- |
| **property** | <span class="mp-arg-type">String, </span></br></span><span class="mp-arg-required">required</span> | 삭제하려고 하는 property name |

___
### greenfinch.reset
super property에 저장되어 있는 모든 항목을 제거하는 함수입니다. 여러개의 super property를 등록 후 일괄 제거가 필요한 시점에서 사용하시면 됩니다.

```javascript
greenfinch.reset();
```
