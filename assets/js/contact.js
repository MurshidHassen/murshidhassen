(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var submitButton = document.getElementById("contact-submit");
  var status = document.getElementById("contact-status");
  var endpoint = "https://formsubmit.co/ajax/murshid.hassen@gmail.com";

  function setStatus(message, type) {
    status.textContent = message;
    status.className = "form-status" + (type ? " form-status-" + type : "");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.", "error");
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      return;
    }

    setStatus("Sending…", "");
    submitButton.disabled = true;

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: name,
        _replyto: email,
        email: email,
        message: message,
        _subject: "New message from murshidhassen.com — " + name,
        _template: "table",
        _captcha: "false",
      }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Request failed with status " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (data && data.success === "true") {
          setStatus("Thanks — your message was sent. I'll get back to you soon.", "success");
          form.reset();
        } else {
          setStatus("Something went wrong. Try again, or email me directly at murshid.hassen@gmail.com.", "error");
        }
      })
      .catch(function () {
        setStatus("Couldn't send right now. Email me directly at murshid.hassen@gmail.com instead.", "error");
      })
      .finally(function () {
        submitButton.disabled = false;
      });
  });
})();
