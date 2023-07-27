import React from "react";
import { useState } from 'react';
const ContactForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorNameMessage, setErrorNameMessage] = useState("");
  const [errorEmailMessage, setErrorEmailMessage] = useState("");
  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault()
    console.log("testt");
    let isValidate = false;
    const contactName = (
      event.target as unknown as HTMLFormElement
    ).querySelector("#contactName") as HTMLInputElement;
    const contactEmail = (
      event.target as unknown as HTMLFormElement
    ).querySelector("#contactEmail") as HTMLInputElement;
    const contactSubject = (
      event.target as unknown as HTMLFormElement
    ).querySelector("#contactSubject") as HTMLInputElement;
    const contactMessage = (
      event.target as unknown as HTMLFormElement
    ).querySelector("#contactMessage") as HTMLInputElement;
    console.log(contactName.value,contactEmail.value,contactSubject.value,contactMessage.value);
    if (contactName.value == "") {
      isValidate = true;
      setErrorNameMessage("Please enter name");
    } else {
      setErrorNameMessage("");
    }

    if (contactEmail.value == "") {
      isValidate = true;
      setErrorEmailMessage("Please enter email");
    } else if (!isValidEmail(contactEmail.value)) {
      isValidate = true;
      setErrorEmailMessage("Please enter valid email");
    } else {
      setErrorEmailMessage("");
    }

    if (isValidate) {
      event.preventDefault();
      return false;
    }
    const clearForm = (): void => {
      if (contactName.value != null)
      contactName.value = "";
      if (contactEmail.value != null)
        contactEmail.value = "";
      if (contactSubject.value  != null)
        contactSubject.value = "";
      if (contactMessage.value  != null)
       contactMessage.value = "";
    };

    let formData = new FormData();  //formdata object
    const uid = uuidv4();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", "c395a3fe-0638-3616-d4dc-5d7f5d7729be");
    formData.append("client_secret", "K^&OOv#nvNTw");
    fetch("https://crm.netspective.com/Api/access_token", {
      headers: {
        Accept: "application/vnd.api+json",
      },
      method: "POST",
      body: formData,
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(data.access_token);
        const access_token = data.access_token;

        // second call starts
        fetch("https://crm.netspective.com/Api/V8/module", {
          method: "POST",
          headers: {
            Accept: "application/vnd.api+json",
            Authorization: "Bearer " + access_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "Contacts",
              id: uid,
              attributes: {
                first_name: contactName.value,
                email1: contactEmail.value,
                description: contactMessage.value,
                lead_source: "Web Site",
                title: contactSubject.value,
              },
            },
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            const contactId= data.data.id;
            // Third call Start
            fetch("https://crm.netspective.com/Api/V8/module/Accounts/be63b2af-97c4-d409-4b20-5d7f5cb06641/relationships", {
              method: "POST",
              headers: {
                Accept: "application/vnd.api+json",
                Authorization: "Bearer " + access_token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  type: "Contacts",
                  id: contactId,
                },
              }),

            })
            .then((response) => response.json())
            .then(async (data) => {
              console.log(data);              
              const formData = new FormData();
              formData.append("name", contactName.value);
              formData.append("email", contactEmail.value);
              formData.append("subject", contactSubject.value);
              formData.append("message", contactMessage.value);
              const responseMail = fetch("https://formspree.io/Gunjan.siroya@netspective.com", {
                method: "POST",
                body: formData,
              });
            console.log(responseMail);
            setIsSubmitted(true);
              clearForm();
                // Hide the success message after 30 seconds
                setTimeout(() => {
                  setIsSubmitted(false);
                }, 10000);
            })

            // Third call ends



          })
          .catch((error) => {
            console.error(error);
            
          });
        // second call ends

      })
      .catch((error) => {
        console.error(error);
      });
    

  }
  const isValidEmail = (email: string): boolean => {
    const regex =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return !(email.length === 0 || regex.test(email)=== false);
  };
  return (
    <form id="quickcontact" onSubmit={(event: React.FormEvent<HTMLFormElement>) => handleSubmitForm(event)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              <div className="mr-3 ml-3">
                <div className="mb-3">
                  <input type="text" name="name" id="contactName" placeholder="*Name" autoComplete="given-name" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  <p className="text-red-500">{errorNameMessage}</p>
                </div>
                <div className="mb-3">
                  <input id="contactEmail" name="email" type="email" autoComplete="email" placeholder="*Email"  className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  <p className="text-red-500">{errorEmailMessage}</p>
                </div>
                <div className="mb-3">
                  <input id="contactSubject" name="subject" type="text" placeholder="Subject" autoComplete="email" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div className="mr-3 ml-3">
                <div className="mb-3">
                  <textarea id="contactMessage" name="message"  rows={4} placeholder=" Message" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
                </div>
                <button type="submit" id="contactSubmit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Send message</button>
                {isSubmitted && (
                  <div className="text-green-600">
                    Form submitted successfully!
                  </div>
                )}
              </div>
              
              <input type="hidden" name="_subject" value="[Netspective Communications] - Contact Form Submission" />
          </div>          
</form>
  )
}
export default ContactForm

function uuidv4(): string {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: string) => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> (+c / 4);
    return (c ^ r).toString(16);
  });
}