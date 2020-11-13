//locomotive scroll

import LocomotiveScroll from 'locomotive-scroll';


const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1
});


//facebook prerequired

window.fbAsyncInit = function() {
    FB.init({
        appId            : 'your-app-id',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v9.0'
    });
};

//glider
//bon for god knows why mon listener marche pas yeah /(.^.)\
window.addEventListener('load', function(){
    new Glider(document.querySelector(".glider"), {
        slidesToShow: 1,
        draggable: true,
        dots: '#dots',
        arrows: {
            prev: '.glider-prev',
            next: '.glider-next',
        },
        responsive: [
            {
                breakpoint: 775,
                settings: {
                    slidesToShow: '2',
                    duration: 0.25
                }
            }, {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    duration: 0.25
                }
            }
        ]
    })
});

//validate

function validate(){
    let formName = document.forms['feedback']['name'].value;
    console.log(formName);
    let formLastname = document.forms['feedback']['lastname'].value;
    console.log(formLastname);
    let formWebsite = document.forms['feedback']['website'].value;
    console.log(formWebsite);
    let formYesno = document.forms['feedback']['yesno'].value;
    console.log(formYesno);

    if (formName == ""){
        alert("All required field must be filled out");
        return false;
    }

    else if(formLastname == ""){
        alert("All required field must be filled out");
        return false;
    }

    else if(formWebsite == ""){
        alert("All required field must be filled out");
        return false;
    }

    else if(formYesno == ""){
        alert("All required field must be filled out");
        return false;
    }

    alert('Thank you for your feedbacks');
}

