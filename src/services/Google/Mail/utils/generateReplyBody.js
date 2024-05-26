const generateReplyBody = (body, message) => {
  // console.log('=== textHtml ===');
  // console.log(message.textHtml);
  // console.log('=== snippet ===');
  // console.log(message.snippet);
  const res = message.headers.from.indexOf('<');
  let email = message.headers.from;
  if (res !== -1) {
    email = message.headers.from.substring(
      res + 1,
      message.headers.from.length - 1
    );
  }
  console.log(email);
  return `${body}
  <br/>
  <div class="HOEnZb adL>
  	<div class="adm">
	  <div id="q_28" class="ajR h4" aria-label="Show trimmed content" aria-expanded="false" data-tooltip="Show trimmed content"><div class="ajT"></div></div>
	</div>
  	<div class="h5">
  		<br>
		<div class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">
		<div dir="ltr" class="gmail_attr">
			${message.headers.date} <a href="mailto:${email}" target="_blank" rel="noreferrer">${email}</a>; wrote:<br>
			${message.textHtml}
		</div>
		</div>
	</div>
  </div>`;
};

module.exports = generateReplyBody;
