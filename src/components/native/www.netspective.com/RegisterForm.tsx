import { FormEvent, useState } from 'react';
import  { useEffect } from 'react';
import React from "react";
interface FormData {
  name: string;
  email: string;
  address: string;
  jobtitle: string;
  postalcode: string;
  remarks: string;
  organization: string;
  phonenumber: string;
}
const RegisterForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    jobtitle: '',
    postalcode: '',
    remarks: '',
    organization: '',
    phonenumber: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
    useEffect(() => {
      let url = window.location.search;
      url = url.replace("?q=", '');
      let formTitle = '';
      if(url == '1'){
         formTitle = "Request A Free Demo";
      }
      else if(url == '2'){
        formTitle = "Get a Free Consultation Today";
      }
      else if(url == '3'){
        formTitle = "Get in Touch With Our Experts";
      }
      else if(url == '4'){
        formTitle = "Get a Free Basic Risk Assessment Today";
      }
      // Do something with the modified URL
      console.log(url);
      const registerHead = document.getElementById('registerhead');
    if (registerHead) {
      registerHead.innerHTML = formTitle;
    }
    

    });
    const handleChange = (e: { target: { name: any; value: any }; }) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    
      setErrors({
        ...errors,
        [e.target.name]: '', // Clear the error message for the corresponding field
      });
    };
    
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      jobtitle: '',
      postalcode: '',
      remarks: '',
      organization: '',
      phonenumber: ''
    });
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const validationErrors: Partial<FormData> = {};
  
    if (!formData.name.trim()) {
      validationErrors.name = 'Name is required';
    }
  
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email.trim())) {
      validationErrors.email = 'Invalid email format';
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Form submission logic
      
      const searchParams = new URLSearchParams();
      searchParams.append('name', formData.name);
      searchParams.append('email', formData.email);
      searchParams.append('address', formData.address);
      searchParams.append('jobtitle', formData.jobtitle);
      searchParams.append('postalcode', formData.postalcode);
      searchParams.append('remarks', formData.remarks);
      searchParams.append('organization', formData.organization);
      searchParams.append('phonenumber', formData.phonenumber);
  
      const responseMail = fetch("https://formspree.io/Gunjan.siroya@netspective.com", {
        method: "POST",
        body: searchParams.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        handleReset();
      }, 10000);
      // Submit the form data or perform other actions
      console.log('Form submitted:', responseMail);
    }
  };
  

  const isValidEmail = (email: string) => {
    // Email validation logic
    // Return true if email is valid, false otherwise
    return /\S+@\S+\.\S+/.test(email);
  };
  return (
    <><div className="text-center"><h3 className="text-2xl font-bold mb-10 mt-4 text-center inline-flex"><span className="bg-orange-600 text-white py-2 px-8"  id="registerhead"></span></h3></div><form id="register" onSubmit={(event: React.FormEvent<HTMLFormElement>) => handleSubmit(event)} onReset={handleReset}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
        <div className="mr-3">
          <div className="mb-3">
            <input type="text" name="name" id="name" placeholder="*Name" autoComplete="given-name" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="text-red-500">{errors.name}</p>}
          </div>
          <div className="mb-3">
            <input id="jobtitle" name="jobtitle" type="text" autoComplete="jobtitle" placeholder="Jobtitle" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.jobtitle} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input id="address" name="address" type="text" placeholder="Address" autoComplete="Address" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.address} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input id="postalcode" name="postalcode" type="text" placeholder="ZIP/Postal Code" autoComplete="postalcode" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.postalcode} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input id="remarks" name="remarks" type="text" placeholder="Remarks" autoComplete="remarks" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.remarks} onChange={handleChange} />
          </div>
        </div>
        <div>
          <div className="mb-3">
            <input type="email" name="email" id="email" placeholder="*Email" autoComplete="given-name" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>
          <div className="mb-3">
            <input id="organization" name="organization" type="text" placeholder="Organization" autoComplete="organization" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.organization} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input id="phonenumber" name="phonenumber" type="text" placeholder="Phone Number" autoComplete="Phone Number" className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={formData.phonenumber} onChange={handleChange} />
          </div>
          <button type="submit" id="registerSubmit" className="rounded-md bg-orange-600 px-3 py-2 mr-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">SIGN UP</button>
          <button type="reset" id="registerReset" className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">RESET</button>
            {isSubmitted && (
              <div className="text-green-600">
                Form submitted successfully!
              </div>
            )}
        </div>
      </div>
    </form></>
  )
}

export default RegisterForm;
