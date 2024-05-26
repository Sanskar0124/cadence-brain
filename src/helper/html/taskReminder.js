const taskReminder = ({
  task_type,
  first_name,
  lead_first_name,
  lead_last_name,
  reminder_time,
  url,
}) => {
  return `<!DOCTYPE 
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reminder</title>
    </head>
    <body style="padding: 0; margin: 0; font-family: 'Open Sans', sans-serif">
      <div
        style="
          padding: 0;
          margin: 0;
          border-radius: 10px;
          max-height: 100vh;
          overflow: hidden;
        "
      >
        <div
          style="
            background-color:#5b6be1;
            background: linear-gradient(
              106.52deg,
              #a282e8 -11.57%,
              #7e8ee7 50.39%,
              #4499e9 116.35%
            );
            text-align: center;
            padding: 50px 0;
          "
        >
          <div style="display: inline-block">
            <img
              src="https://storage.googleapis.com/apt-cubist-307713.appspot.com/ringover_logo_white.png"
            />
          </div>
          <div
            style="
              display: inline-block;
              font-weight: 400;
              font-size: 18.5455px;
              line-height: 20px;
              color: #ffffff;
              width: 120px;
              position: relative;
              transform: translateY(-5px);
            "
          >
            <span
              style="
                font-weight: 700;
                font-size: 24.7273px;
                line-height: 20px;
                margin: 0;
                padding: 0;
                color: #ffffff;
              "
              >Cadence</span
            >
            <p style="margin: 0; padding: 0">by ringover</p>
          </div>
        </div>
        <div  
          style="padding: 100px 0; position: relative; background-color: #f3f9f8"
        >
          <div
            style="
              width: 80%;
              margin: auto;
              margin-bottom: 90px;
              text-align: left;
              font-weight: 600;
              font-size: 20px;
              line-height: 27px;
              color: #567191;
            "
          >
            Hi ${first_name},<br><br>
            We’d like to remind you that your ${task_type} with ${lead_first_name} ${lead_last_name} is coming up in ${reminder_time} mins!
          </div>
          <a
            href="${url}"
            style="
              display: block;
              margin: auto;
              padding: 20px 24px;
              text-align: center;
              border: none;
              box-sizing: border-box;
              width: 70%;
              background-color:#5b6be1;
              background: linear-gradient(
                106.52deg,
                #a282e8 -11.57%,
                #7e8ee7 50.39%,
                #4499e9 116.35%
              );
              box-shadow: 1px 8px 24px rgba(125, 142, 231, 0.4);
              border-radius: 15px;
              font-weight: 700;
              font-size: 14px;
              color: #ffffff;
              text-decoration: none;
              cursor: pointer;
            "
          >
            Go to Cadence
          </a>
          </div>
      </div>  
      </body>
      </html>`;
};

module.exports = taskReminder;
