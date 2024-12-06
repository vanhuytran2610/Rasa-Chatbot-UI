<template>
  <div v-show="showPopover" class="popup">
    <div class="container">
      <div class="row justify-content-center">
        <div class="card" :style="stylecard">
          <div class="cardHeader" :style="styleHeader">
            <button class="close-button" @click="closeModal">-</button>
            <h5 class="text-black" style="margin-top: 2%; margin-left: 2%">
              ChatBot
            </h5>
            <h6
              class="text-white"
              style="margin-top: 2%; margin-left: 2%"
              v-if="botTyping"
            >
              Bot Typing....
            </h6>
          </div>
          <div class="cardBody" id="messageArea" :style="styleBody">
            <div class="row msgarea">
              <div v-for="(message, index) in chat" :key="index">
                <div v-if="message.sender === 'bot'" class="msgalignstart">
                  <template v-if="message.type === 'text'">
                    <div class="botIcon"><i class="fas fa-robot"></i></div>
                    <h6 class="botmsg" v-html="formatMessage(message.msg)"></h6>
                  </template>
                  <template v-else-if="message.type === 'button'">
                    <div class="botIcon"><i class="fas fa-robot"></i></div>
                    <h6 class="botmsg">
                      {{ message.msg }}
                      <ul class="botmsg" style="list-style-type: none">
                        <li
                          v-for="(btn, btnIndex) in message.button"
                          :key="btnIndex"
                          style="margin-bottom: 3%; padding-left: 0%"
                        >
                          <div v-if="btn.title.toLowerCase().includes('back')">
                            <hr />
                          </div>
                          <button class="btn-country" @click="handleClick(btn)">
                            {{ btn.title }}
                          </button>
                        </li>
                      </ul>
                    </h6>
                  </template>
                  <template v-else>
                    <div class="botIcon"><i class="fas fa-robot"></i></div>
                    <img class="botmsg" :src="message.msg" alt="Bot response" />
                  </template>
                </div>
                <div v-else class="msgalignend">
                  <h6 class="usermsg">{{ message.msg }}</h6>
                  <div class="userIcon"><i class="fas fa-user"></i></div>
                </div>
              </div>
            </div>
          </div>
          <div class="cardFooter text-white" :style="styleFooter">
            <div class="row">
              <form style="display: flex" @submit.prevent="handleSubmit">
                <div class="col-11" style="padding-right: 0px">
                  <input v-model="inputMessage" type="text" class="msginp" />
                </div>
                <div class="col-1">
                  <button type="submit" class="circleBtn">
                    <i class="fas fa-play"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["showPopover"],
  data() {
    return {
      chat: [],
      inputMessage: "",
      actionResponse: {},
      botTyping: false,
      stylecard: {
        width: "65rem",
        height: "28rem",
        border: "1px solid black",
        paddingLeft: "0px",
        paddingRight: "0px",
        borderRadius: "20px",
        boxShadow: "0 16px 20px 0 rgba(0,0,0,0.4)",
      },
      styleHeader: {
        height: "5rem",
        borderBottom: "1px solid black",
        borderRadius: "20px 20px 0px 0px",
        backgroundColor: "#C0C0C0",
      },
      styleFooter: {
        height: "3.5rem",
        borderTop: "1px solid black",
        borderRadius: "0px 0px 20px 20px",
        backgroundColor: "#C0C0C0",
      },
      styleBody: {
        paddingTop: "10px",
        height: "25rem",
        overflowY: "auto",
        overflowX: "hidden",
      },
      openedUrls: [],
    };
  },
  mounted() {
    this.restartChat();
  },
  methods: {
    async rasaAPI(user_id, msg, token) {
      try {
        const response = await fetch(
          "http://localhost:5005/webhooks/rest/webhook",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              charset: "UTF-8",
            },
            credentials: "same-origin",
            body: JSON.stringify({
              sender: user_id,
              message: msg,
              metadata: {
                token: token
              },
            }),
          }
        );
        const data = await response.json();
        console.log(data);
        if (data) {
          data.forEach((temp) => {
            // console.log(temp);
            const recipient_id = temp.recipient_id;
            let response_temp = {
              sender: "bot",
              recipient_id: recipient_id,
              msg: "",
              type: "",
              button: [],
            };
            let text_response = "";
            if (temp.text) {
              // if (temp.text.includes("http")) {
              //   temp.text = temp.text.replace(/(http\S+)/g, '<a href="$1">$1</a>');
              // }
              if (temp.text.includes("message")) {
                let json_parse = {};
                json_parse = JSON.parse(temp.text);
                if (json_parse?.question_type === "export") {
                  this.actionResponse = json_parse?.value;
                  this.actionResponse.formatted_file =
                    json_parse?.formatted_file;
                }
                console.log("action", this.actionResponse);
                text_response = json_parse?.message;
              } else {
                text_response = temp.text;
              }
              if (text_response.includes("\n")) {
                const lines = text_response.split("\n");

                const formattedLines = lines.map((line) => {
                  const trimmedLine = line.trim();
                  console.log(trimmedLine);
                  if (trimmedLine.startsWith("-")) {
                    return `<li>${trimmedLine.substring(1).trim()}</li>`;
                  } else {
                    return trimmedLine;
                  }
                });

                const finalOutput = [];
                let currentListItems = [];
                let inList = false;

                formattedLines.forEach((line) => {
                  if (line.startsWith("<li>")) {
                    if (!inList) {
                      inList = true;
                      currentListItems = ['<ul style="margin-top: 0;">'];
                    }
                    currentListItems.push(line);
                  } else {
                    if (inList) {
                      inList = false;
                      currentListItems.push("</ul>");
                      finalOutput.push(currentListItems.join(""));
                      currentListItems = [];
                    }
                    finalOutput.push(line);
                  }
                });

                if (inList) {
                  currentListItems.push("</ul>");
                  finalOutput.push(currentListItems.join(""));
                }

                text_response = finalOutput.join("");
              }

              response_temp.msg = text_response;
              response_temp.type = "text";
            }
            // console.log("temp", temp.buttons);
            if (temp.buttons && temp.buttons.length > 0) {
              response_temp.type = "button";
              response_temp.button = temp.buttons;
            }
            // if (temp.image) {
            //   response_temp.msg = temp.image;
            //   response_temp.type = "image";
            //   window.open(response_temp.msg, "_blank");
            // }
            console.log("res_temp", response_temp);
            this.botTyping = false;
            this.chat.push(response_temp);
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    handleClick(btn) {
      const user_id = 1;
      const request_temp = { sender: user_id, msg: btn.title };
      const token ="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQyYjBhN2EyMjM1YjBmMGZiMDYxOGM1NzEyY2I4YWRmOWJlODk1YjJmNzg5ODhiNTY3M2U4YTkyNzAyYTZjYzA4ZDNjOWI5NDdjYTM2MjM4In0.eyJhdWQiOiIxIiwianRpIjoiZDJiMGE3YTIyMzViMGYwZmIwNjE4YzU3MTJjYjhhZGY5YmU4OTViMmY3ODk4OGI1NjczZThhOTI3MDJhNmNjMDhkM2M5Yjk0N2NhMzYyMzgiLCJpYXQiOjE3Mjk1NzI1ODQsIm5iZiI6MTcyOTU3MjU4NCwiZXhwIjoxNzYxMTA4NTg0LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.I-1azaI13n4ZISM0mjht1EGX7nSocJAeuRdoQexkgis8bKSe2tIvZPcjvft1zqrQLzWSA2wSkFWybeQb52FhYXkcDmkU_6IXTv4YSxBoMi5_UPw81dl6lspoSgDRzRpGuyu6Dt60KpYzT6rspZzsju97BNobUvcsctd-_KKNRs4F7FEJNX9Adtd6nBvp38OzCLtDRJVywLl6phSQPl4SfMkt2TmoPea9Cm0xter2UNKAnC3L2FaSeOW_3HaVidximessx8Pl-koBlZI0H0keU0kWXhXM-FjGoz8-5mpqhwsLvpzpHGLbqpIbkTOZVDm8Jzkx3D3A7941TYx9geg5D-Q89CCA9b88wXL-oxUjfLYeIb04Et_HSmXSNKFfScsobjRpC-VMp9yjm1qFKA8nDBD2KM8WTexlNUn_VxTMFzW0c0pkL0fUCDM8ohcrgfjdBB0QXP59symxFxXbg_mS8vT_NtjJU2N110U_rJxSxLVD8JaxpmuaYxtamrK0raUq8LOqwD0St1banT8J9WzbNg_5B8JidQZLVC3xyU8QStjE6hlcfPsqq6wSCygZhV2ZWiNYHlMmLRdeLYkTvxjDYxw9xaE4g65gbwsumJWEo3kdtI7fyIX-PkozmOAel-Da0R1UmtYpPG_hp4JzvkLEh14yAATzQPnRNN1hpWzkSjU";
      if (btn.payload !== "") {
        this.chat.push(request_temp);
        this.botTyping = true;
        btn.payload.includes("export{") ||
        btn.payload.includes("adjust_info{") ||
        !btn.payload.includes("{")
          ? this.rasaAPI(user_id, btn.payload, token)
          : this.rasaAPI(user_id, btn.title, token);
        console.log(request_temp);
        this.inputMessage = "";
      } else {
        window.alert("Please enter valid message");
      }
    },
    handleSubmit() {
      const user_id = "user_id";
      const request_temp = {
        sender: user_id,
        msg: this.inputMessage,
      };
      const token ="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQyYjBhN2EyMjM1YjBmMGZiMDYxOGM1NzEyY2I4YWRmOWJlODk1YjJmNzg5ODhiNTY3M2U4YTkyNzAyYTZjYzA4ZDNjOWI5NDdjYTM2MjM4In0.eyJhdWQiOiIxIiwianRpIjoiZDJiMGE3YTIyMzViMGYwZmIwNjE4YzU3MTJjYjhhZGY5YmU4OTViMmY3ODk4OGI1NjczZThhOTI3MDJhNmNjMDhkM2M5Yjk0N2NhMzYyMzgiLCJpYXQiOjE3Mjk1NzI1ODQsIm5iZiI6MTcyOTU3MjU4NCwiZXhwIjoxNzYxMTA4NTg0LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.I-1azaI13n4ZISM0mjht1EGX7nSocJAeuRdoQexkgis8bKSe2tIvZPcjvft1zqrQLzWSA2wSkFWybeQb52FhYXkcDmkU_6IXTv4YSxBoMi5_UPw81dl6lspoSgDRzRpGuyu6Dt60KpYzT6rspZzsju97BNobUvcsctd-_KKNRs4F7FEJNX9Adtd6nBvp38OzCLtDRJVywLl6phSQPl4SfMkt2TmoPea9Cm0xter2UNKAnC3L2FaSeOW_3HaVidximessx8Pl-koBlZI0H0keU0kWXhXM-FjGoz8-5mpqhwsLvpzpHGLbqpIbkTOZVDm8Jzkx3D3A7941TYx9geg5D-Q89CCA9b88wXL-oxUjfLYeIb04Et_HSmXSNKFfScsobjRpC-VMp9yjm1qFKA8nDBD2KM8WTexlNUn_VxTMFzW0c0pkL0fUCDM8ohcrgfjdBB0QXP59symxFxXbg_mS8vT_NtjJU2N110U_rJxSxLVD8JaxpmuaYxtamrK0raUq8LOqwD0St1banT8J9WzbNg_5B8JidQZLVC3xyU8QStjE6hlcfPsqq6wSCygZhV2ZWiNYHlMmLRdeLYkTvxjDYxw9xaE4g65gbwsumJWEo3kdtI7fyIX-PkozmOAel-Da0R1UmtYpPG_hp4JzvkLEh14yAATzQPnRNN1hpWzkSjU";
      if (this.inputMessage !== "") {
        this.chat.push(request_temp);
        this.botTyping = true;
        console.log(request_temp);
        this.rasaAPI(user_id, this.inputMessage, token);
        this.inputMessage = "";
      } else {
        window.alert("Please enter valid message");
      }
    },
    closeModal() {
      this.$emit("close");
    },
    restartChat() {
      this.rasaAPI("User", "home");
      this.inputMessage = "";
    },
    formatMessage(msg) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let msgWithLinks = msg.replace(
        urlRegex,
        '<a href="$1" target="_blank">$1</a>'
      );
      msgWithLinks = msgWithLinks.replace(/\n/g, "<br />");

      const urls = msg.match(urlRegex);
      if (urls) {
        for (const url of urls) {
          if (!this.openedUrls.includes(url)) {
            window.open(url);
            this.openedUrls.push(url);
          }
        }
      }

      return msgWithLinks;
    },
  },
};
</script>

<style scoped>
.popup {
  position: fixed;
  bottom: 90px;
  right: 20px;
  border-radius: 20px;
  display: flex;
  z-index: 999;
  width: 600px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background-color: transparent;
  border: 1;
  width: 23px;
  border-radius: 50%;
  font-size: 12px;
  color: white;
  cursor: pointer;
}

.circleBtn {
  height: 35px;
  width: 35px;
  border-radius: 50%;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 10px;
  border: none;
  background-color: rgb(247, 134, 5);
  padding-left: 15%;
  padding-top: 5%;
}

.msginp {
  width: 95%;
  height: 33px;
  border-radius: 50px 50px 50px 50px;
  margin-top: 10px;
  border: none;
  padding-left: 10px;
  padding-right: 10px;
}

.cola {
  height: 65px;
  width: 65px;
  padding-left: 0px;
}

.msgalignend {
  display: flex;
  justify-content: flex-end;
}

.msgalignstart {
  display: flex;
  justify-content: flex-start;
  min-height: 5px;
}

.botmsg {
  background-color: rgb(241, 212, 173);
  padding-left: 12px;
  padding-right: 15px;
  height: auto;
  min-height: 45px;
  padding-top: 6px;
  padding-bottom: 2px;
  margin-bottom: 10px;
  border-radius: 25px;
  max-width: 18rem;
  text-align: left;
  margin-top: 10px;
}

.usermsg {
  background-color: rgb(199, 199, 201);
  padding-left: 15px;
  padding-right: 15px;
  height: auto;
  min-height: 45px;
  padding-top: 6px;
  padding-bottom: 2px;
  border-radius: 25px;
  max-width: 18rem;
}

.btn-country {
  border-radius: 6px;
  background-color: rgb(204, 204, 212);
  width: 13.5rem;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(236, 135, 19);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #d8c5dd;
}

.botIcon {
  font-size: 20px;
  border: 1px solid black;
  border-radius: 50px;
  margin-left: 5px;
  margin-right: 5px;
  padding-top: 5px;
  width: 45px;
  height: 45px;
}

.userIcon {
  font-size: 20px;
  border: 1px solid black;
  border-radius: 50px;
  margin-left: 5px;
  margin-right: 5px;
  padding-top: 5px;
  width: 45px;
  height: 45px;
}

.sendBtn {
  font-size: 25px;
}
</style>
