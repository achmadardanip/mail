document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#compose-title').value = 'New Email';

  document.querySelector('#compose-form').onsubmit = (e) => {

    e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      alert(result.message)
      load_mailbox('sent')
    });
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').innerHTML =
  `<div id="emails-title"></div>
  <div id="main">
    <table id="tableinbox">
    </table>
  </div>`;
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    table = document.querySelector('#tableinbox');
    table.innerHTML = "<tr><th></th><th>Sender</th><th>Subject</th><th>Body</th><th>Time</th><th>∞</th></tr>";
    if(mailbox == 'sent'){
      table.innerHTML = "<tr><th></th><th>Recipients</th><th>Subject</th><th>Body</th><th>Time</th><th></th></tr>";
    }
    if(emails.length == 0){
      table = document.querySelector('#emails-view');
      p = document.createElement("p");
      p.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)} is Empty`
      table.appendChild(p);
    } else {
      for (i=0; i < emails.length; i++){
        tr = document.createElement("tr");
        tr.setAttribute('data-page', emails[i].id);

        if(mailbox == 'sent'){
          tr.innerHTML = `<td data-page="${emails[i].id}"class="email-link">  </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].recipients} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].subject} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].body} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].timestamp} </td><td data-page="${emails[i].id}"class="email-link"></td>`
        } else if (mailbox == 'archive'){
          if(emails[i].read){
            tr.setAttribute('class', 'read');
            tr.innerHTML = `<td data-page="${emails[i].id}"class="email-link">  </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].sender} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].subject} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].body} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].timestamp} </td><td data-page="${emails[i].id}"class="unarchive_bin alt"> <i class="fa fa-undo" aria-hidden="true"></i><span class="alttext">Unarchive</span> </td>`
          } else {
            tr.setAttribute('class', 'unread');
            tr.innerHTML = `<td data-page="${emails[i].id}"class="email-link"> <i class="fa fa-circle" aria-hidden="true"></i> </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].sender} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].subject} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].body} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].timestamp} </td><td data-page="${emails[i].id}"class="unarchive_bin alt"> <i class="fa fa-undo" aria-hidden="true"></i><span class="alttext">Unarchive</span> </td>`
          }
        } else if (mailbox == 'inbox'){
          if(emails[i].read){
            tr.setAttribute('class', 'read');
            tr.innerHTML = `<td data-page="${emails[i].id}"class="email-link">  </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].sender} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].subject} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].body} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].timestamp} </td><td data-page="${emails[i].id}" class="archive_bin alt"> <i class="fa fa-archive" aria-hidden="true"></i><span class="alttext">Archive</span> </td>`
          } else {
            tr.setAttribute ('class', 'unread');
            tr.innerHTML = `<td data-page="${emails[i].id}"class="email-link"> <i class="fa fa-circle" aria-hidden="true"></i> </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].sender} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].subject} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].body} </td><td data-page="${emails[i].id}"class="email-link"> ${emails[i].timestamp} </td><td data-page="${emails[i].id}"class="archive_bin"> <i class="fa fa-archive" aria-hidden="true"></i> </td>`
          }
        }
        table.appendChild(tr);
        
        //archive
        document.querySelectorAll('.archive_bin').forEach(link => {
          link.onclick = () => {
            fetch(`/emails/${link.dataset.page}`, {
              method: 'PUT',
              body: JSON.stringify
              ({
                archived: true
              })
            })
            setTimeout(function(){
              load_mailbox('inbox')
            }, 50);
          };
        });

        //unarchive
        document.querySelectorAll('.unarchive_bin').forEach(link => {
          link.onclick = () => {
            fetch(`emails/${link.dataset.page}`, {
              method: 'PUT',
              body: JSON.stringify
              ({
                archived: false
              })
            })
            setTimeout(function(){
              load_mailbox('archive')
            }, 50);
          };
        });

        document.querySelectorAll('.email-link').forEach(link => {
          link.onclick = () => {
            fetch(`/emails/${link.dataset.page}`, {
              method: 'PUT',
              body: JSON.stringify
            ({
              read: true
            })
          })

          fetch(`/emails/${link.dataset.page}`)
          .then(response => response.json())
          .then(email => {
            var email_view = document.querySelector('#emails-view')
            email_view.innerHTML = `
            <div class="email-view">
              <span id="iconspan"><h4 class="email-subject">${email.subject}</h4></span>
              <span>From: <p class="email-form"> ${email.sender}</p></span>
              <span id="iconspan">To: <p class="email-to"> ${email.recipients}</p><p class="email-time">${email.timestamp}</p></span>
              <p class="email-body">${email.body}</p>
            </div>
            <div style="display: none;" class="reply-form">
              <form id="reply-form">
              <textarea>

    ------ On ${email.timestamp} ${email.sender} wrote:
             ${email.body}
             </textarea>
             <input class="btn btn-primary" type="submit" value="Reply">
             </form>
             </div>
             `;

             button = document.createElement("button");
             button.setAttribute('class', 'btn btn-primary alt');
             button.setAttribute('id', 'reply');
             button.innerHTML = `<i class="fa fa-reply" aria-hidden="true"></i>`
             button.setAttribute('data-page', link.dataset.page);

             tooltip = document.createElement("span")
             tooltip.setAttribute('class', 'alttext')
             tooltip.innerHTML = 'Reply'
             button.appendChild(tooltip)

             button2 = document.createElement("button");
             button2.setAttribute('class', 'btn btn-danger alt');
             button2.setAttribute('data-page', link.dataset.page);

             tooltip = document.createElement("span")
             tooltip.setAttribute('class', 'alttext')
             if(!email.archived){
              tooltip.innerHTML = 'Archive'
              button2.setAttribute('id', 'unarchive');
              button2.innerHTML = `<i class="fa fa-archive" aria-hidden="true"></i>`
            } else {
              tooltip.innerHTML = 'Unarchive'
              button2.setAttribute('id', 'unarchive');
              button2.innerHTML = `<i class="fa fa-undo" aria-hidden="true"></i>`
            }
            button2.appendChild(tooltip)
            span = document.querySelector('#iconspan')
            div = document.createElement('div')
            div.setAttribute('class', 'divicon')

            button3 = document.createElement("button");
            button3.setAttribute('class', 'btn btn-success alt');
            button2.setAttribute('data-page', link.dataset.page);
            button3.setAttribute('id', 'unread');
            button3.innerHTML = `<i class="fa fa-envelope" aria-hidden="true"></i>`

            tooltip = document.createElement("span")
            tooltip.setAttribute('class', 'alttext')
            tooltip.innerHTML = 'Mark Unread'
            button3.appendChild(tooltip)

            div.appendChild(button);
            if(mailbox != 'sent'){
              div.appendChild(button2);
              div.appendChild(button3);
            }

            span.appendChild(div);

            document.querySelector('#reply').addEventListener('click', function(){
              reply = document.querySelector('#compose-view');

                view = document.querySelector('.email-view');
                title = document.querySelector('#compose-title');
                title.innerHTML = 'Reply Email';
                view.style.display = 'none';
                reply.style.display = 'block';
                recipients = document.querySelector('#compose-recipients');
                recipients.value = email.sender;
                subject = document.querySelector('#compose-subject');
                subject.value = `Re: ${email.subject}`;
                body = document.querySelector('#compose-body');
                body.innerHTML = `
------ On ${email.timestamp} ${email.sender} wrote:
${email.body}`;

              document.querySelector('textarea').focus();
              document.querySelector('textarea').setSelectionRange(0,0);
              document.querySelector('textarea').scrollTop = 0;

              document.querySelector('#reply-form').onsubmit = (e) => {
                e.preventDefault();
                if(mailbox == 'inbox'){
                  recipients = document.querySelector('.email-form').innerHTML
                }
                if(mailbox == 'sent'){
                  recipients = docuement.querySelector('.email-to').innerHTML
                }
                fetch('emails', {
                  method: 'POST',
                  body: JSON.stringify({
                    recipients : recipients,
                    subject: `Re: ${document.querySelector('.email-subject').innerHTML}`,
                    body: document.querySelector('textarea').value
                  })
                })
                .then(response => response.json())
                .then(result => {
                  alert(result['message'])
                  load_mailbox('inbox')
                });
              }
            });

            if(mailbox == 'archive'){
              document.querySelector('#unarchive').addEventListener('click', function(){
                fetch(`/emails/${link.dataset.page}`, {
                  method: 'PUT',
                  body: JSON.stringify
                  ({
                    archived: false
                  })
                })
                setTimeout(function(){
                  load_mailbox('inbox')
                }, 50);
              });
            } else {
              if(mailbox != 'sent'){
                document.querySelector('#archived').addEventListener('click', function(){
                  fetch(`/emails/${link.dataset.page}`, {
                    method: 'PUT',
                    body: JSON.stringify
                    ({
                      archived: true
                    })
                  })
                  setTimeout(function(){
                    load_mailbox('inbox')
                  }, 50);
                });
              }
            }

            if(mailbox != 'sent'){
              document.querySelector('#unread').addEventListener('click', function (){
                fetch(`emails/${link.dataset.page}`, {
                  method: 'PUT',
                  body: JSON.stringify
                ({
                  read: false
                })
                })
                setTimeout(function(){
                  load_mailbox('inbox')
                }, 50);
              })
            }
          
          });
        };
      }
      )}
  }
});
}