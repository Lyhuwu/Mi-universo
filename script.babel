
const timeline = gsap.timeline({
  duration: 0.3,
});

timeline.fromTo('.cake-topping', {
  yPercent: -300,
  opacity: 0.5
}, {
  yPercent: 0,
  opacity: 1
});

timeline.to('.candle-container', {
  opacity: 1
});

timeline.to('.flame-wrap', {
  scale: 1,
  ease: "back.out",
})

timeline.to('.greeting', {
  scale: 1,
  ease: "back.out"
})

timeline.to('.star',{
  opacity: 0.5,
  stagger: 0.05,
  onComplete: function(){
    gsap.to('.star', {
      scale: 0.25,
      repeat: -1,
      stagger: 0.1,
      yoyo: true,
      yoyoEase: "power1.out"
    })
  }
})
