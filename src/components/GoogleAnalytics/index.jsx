import React from "react";
import Script from "next/script";

const GoogleAnalytics = () => (
	<>
		<Script
			async
			src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
		></Script>
		<Script
			id="google-analytics"
			dangerouslySetInnerHTML={{
				__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
        `
			}}
		></Script>
		<Script
			id="google-analytics-form-submit"
			dangerouslySetInnerHTML={{
				__html: `window.addEventListener('click',function(e){
    if(e.target.closest('form [type="submit"]')){
      gtag('set','user_data',{'email':document.querySelector('[type="email"]').value})
    }
  })
  var x = 0;
  var timer = setInterval(function(){
    if(window.location.href.includes('/contact-us?status=success')){
      if(x==0){
        gtag('event', 'form_submit_success');
        x=1;
      }
      clearInterval(timer);
    }
  },1000)`
			}}
		></Script>
	</>
);

export default GoogleAnalytics;
