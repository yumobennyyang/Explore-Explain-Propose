import { useState } from 'react'
import React from 'react'
import SplitText from './components/SplitText.jsx'
import FaultyTerminal from './components/FaultyTerminal.jsx'
import TiltedCard from './components/TiltedCard.jsx';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

import { useRef } from 'react';
import VariableProximity from './components/VariableProximity';
import FluidGlass from './components/FluidGlass'
import MapboxNoiseMap from './components/MapboxNoiseMap.jsx';

import DecayCard from './components/DecayCard';



import './App.css'


function App() {

  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const dot = document.getElementById('dot');
    const container = document.querySelector('.container');
    const secondPage = document.querySelector('.page:nth-child(2)');
    const eyecue2Page = document.querySelector('.page:nth-child(3)');
    const eyecue25Page = document.querySelector('.page:nth-child(4)');
    const thirdPage = document.querySelector('.page:nth-child(6)');
    const putThatTherePage = document.querySelector('.page:nth-child(7)');
    const samPage = document.querySelector('.page:nth-child(8)');
    const fourthPage = document.querySelector('.page:nth-child(9)');



    if (!dot || !container || !secondPage || !thirdPage || !fourthPage || !eyecue2Page || !eyecue25Page || !putThatTherePage || !samPage) return;

    // Set initial container background
    container.style.backgroundColor = '#cccccc';

    // Required for custom scroller containers
    ScrollTrigger.scrollerProxy(container, {
      scrollTop(value) {
        if (arguments.length) {
          container.scrollTop = value;
        }
        return container.scrollTop;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      },
      pinType: container.style.transform ? "transform" : "fixed"
    });

    // Set default scroller to your container
    ScrollTrigger.defaults({ scroller: container });

    // Your existing dot animation
    gsap.to(dot, {
      y: '-150px',
      ease: 'none',
      scrollTrigger: {
        trigger: secondPage,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        markers: false,
      },
    });

    // Background color animation tied to third page
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: thirdPage,
        endTrigger: samPage,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        markers: false,
        scroller: container,
        onUpdate: (self) => {
          console.log('Background animation progress:', self.progress);
        },
        onToggle: (self) => {
          console.log('Background animation toggle:', self.isActive);
        }
      }
    });

    tl.to(container, { backgroundColor: '#000000', duration: 1 }) // from top bottom to top top
      .to(container, { backgroundColor: '#000000', duration: 3 }) // hold black
      .to(container, { backgroundColor: '#cccccc', duration: 1 }); // from top top to bottom top


    // Image sequence scrubbing
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const frameCount = 151;
    const currentFrame = { value: 1 };
    const images = [];

    // Preload images
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/eyecue1-frames/frame_${i.toString().padStart(4, '0')}.jpg`;
      images.push(img);
    }

    const render = () => {
      if (!context || !canvas) return;
      const frameIndex = Math.floor(currentFrame.value) - 1;
      if (frameIndex < 0 || frameIndex >= images.length) return;

      const img = images[frameIndex];
      if (img && img.complete && img.naturalWidth > 0) {
        if (canvas.width !== img.naturalWidth) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        context.drawImage(img, 0, 0);
      }
    };

    if (canvas && eyecue2Page) {
      // Initial render attempt
      if (images[0].complete) {
        render();
      } else {
        images[0].onload = render;
      }

      const eyecueImg1 = document.querySelector('.eyecue-img-1');
      const eyecueImg2 = document.querySelector('.eyecue-img-2');

      if (eyecueImg2) {
        gsap.set(eyecueImg2, { opacity: 0 });
      }

      const tlVideo = gsap.timeline({
        scrollTrigger: {
          trigger: eyecue2Page,
          start: "top bottom",
          end: "top top",
          scrub: 0,
          scroller: container,
          markers: false,
          onLeaveBack: () => {
            gsap.set(canvas, { opacity: 0 });
            gsap.set(eyecueImg1, { opacity: 1 });
          }
        }
      });

      // Ensure initial states
      gsap.set(canvas, { opacity: 0 });
      gsap.set(eyecueImg1, { opacity: 1 });
      gsap.set(eyecueImg2, { opacity: 0 });

      tlVideo
        .to(eyecueImg1, { opacity: 0, duration: 0 }, 0)
        .to(canvas, { opacity: 1, duration: 0 }, 0)
        .fromTo(currentFrame, { value: 1 }, {
          value: frameCount,
          duration: 1,
          onUpdate: render,
          ease: "none"
        }, 0)
        .to(canvas, { opacity: 0, duration: 0 }, 1)
        .to(eyecueImg2, { opacity: 1, duration: 0 }, 1);

      const eyecueImg25 = document.querySelector('.eyecue-img-25');
      const fixedEyecue2 = document.querySelector('.fixed-eyecue-2');
      const fixedEyecue25 = document.querySelector('.fixed-eyecue-25');

      if (eyecueImg25 && fixedEyecue2 && fixedEyecue25) {
        gsap.set(eyecueImg25, { opacity: 0 });
        gsap.set(fixedEyecue2, { opacity: 0 });
        gsap.set(fixedEyecue25, { opacity: 0 });

        const tlEyecue25 = gsap.timeline({
          scrollTrigger: {
            trigger: eyecue25Page,
            start: "top bottom",
            end: "top top",
            scrub: true,
            scroller: container,
            markers: false,
            onLeaveBack: () => {
              gsap.set(fixedEyecue2, { opacity: 0 });
              gsap.set(fixedEyecue25, { opacity: 0 });
              gsap.set(eyecueImg2, { opacity: 1 });
            }
          }
        });

        tlEyecue25
          .to(eyecueImg2, { opacity: 0, duration: 0 }, 0)
          .to(fixedEyecue2, { opacity: 1, duration: 0 }, 0)
          .to(fixedEyecue25, { opacity: 0, duration: 0 }, 0)
          .to(fixedEyecue25, { opacity: 1, duration: 1 }, 0)
          .to(fixedEyecue2, { opacity: 0, duration: 0 }, 1)
          .to(fixedEyecue25, { opacity: 0, duration: 0 }, 1)
          .to(eyecueImg25, { opacity: 1, duration: 0 }, 1);
      }
    }    // Enter animations for multiple elements
    const animatedElements = document.querySelectorAll('.framework-title, .page-text, .video-text, .label, .precedent-1, .video-1, .tilted-card-1, .thank-you');
    animatedElements.forEach((element) => {
      if (element) {
        // Set initial state
        gsap.set(element, { y: 40, opacity: 0 });

        gsap.to(element, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            scroller: container,
            markers: false,
          },
        });
      }
    });



    const rotationElements = document.querySelectorAll('.map-image');
    rotationElements.forEach((element) => {
      if (element) {
        // Set initial state
        gsap.set(element, { y: 40, opacity: 0, rotation: 100 });

        gsap.to(element, {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: 'elastic.out(0.1,0.8)',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            scroller: container,
            markers: false,
          },
        });
      }
    });




    const animated47 = document.querySelectorAll('.precedent-2, .video-2, .question-1 ');
    animated47.forEach((element) => {
      if (element) {
        // Set initial state
        gsap.set(element, { y: 47, opacity: 0 });

        gsap.to(element, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            scroller: container,
            markers: false,
          },
        });
      }
    });


    const animated53 = document.querySelectorAll('.precedent-3, .video-3, .tilted-card-2, .question-2');
    animated53.forEach((element) => {
      if (element) {
        // Set initial state
        gsap.set(element, { y: 53, opacity: 0 });

        gsap.to(element, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            scroller: container,
            markers: false,
          },
        });
      }
    });


    const animatedVisuals = document.querySelectorAll('.circle-container, .page-image, .precedent-4, .video-4, .tilted-card-3, .diagram-image, .grasshopper-image, .canvas-block, .question-3 ');
    animatedVisuals.forEach((element) => {
      if (element) {
        // Set initial state
        gsap.set(element, { y: 60, opacity: 0 });

        gsap.to(element, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            scroller: container,
            markers: false,
          },
        });
      }
    });



    // Delay to ensure DOM renders before GSAP runs
    setTimeout(() => {
      const responsiveRect = document.querySelector('.responsive-rectangle');
      const parallaxImg = document.querySelector('.parallax-image');

      if (responsiveRect && parallaxImg) {
        gsap.to(parallaxImg, {
          y: '-80%', // Adjust parallax depth here
          ease: 'none',
          scrollTrigger: {
            trigger: responsiveRect,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scroller: container, // custom scroll container
            markers: false,
          },
        });
      }

      ScrollTrigger.refresh(); // just in case
    }, 50);


    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="container">
      <div className="page" style={{ flexDirection: 'column' }}>

        <h1 className="" style={{ fontWeight: 400, margin: '0 0 0 0', textAlign: 'center' }}>Seeing as Interface</h1>
        <h2 className="" style={{ margin: 0, textAlign: 'center' }}>
          <span className=" title-screen" id="title-screen">a gaze-to-context protocol for human-AI interaction</span>
        </h2>

        <img src="/dot.png" alt="dot" className="dot" id="dot" style={{ position: 'relative', transform: 'none', marginBottom: '1rem' }}></img>
      </div>

      <div className="page">
        <img src="/eyecue1.png" alt="Big Image" className="eyecue-img-1" style={{ width: '80%', height: 'auto' }} />
      </div>

      <div className="page">
        <img src="/eyecue2.png" alt="Big Image 2" className="eyecue-img-2" style={{ width: '80%', height: 'auto' }} />
      </div>

      <div className="page">
        <img src="/eyecue25.png" alt="Big Image 2.5" className="eyecue-img-25" style={{ width: '80%', height: 'auto' }} />
      </div>

      <div className="page">
        <SplitText
          text="EyeCue investigates whether everyday gaze captured through commodity devices can serve as a foundational input for embodied, hyperaware computational systems that reveal, interpret, and respond to patterns of human attention across space, time, and lived contexts."
          className="page-two"
          delay={60}
          duration={1}
          ease="power3.out"
          splitType="words"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          textAlign="left"
          onLetterAnimationComplete={() => {
            console.log("Animation complete");
          }}
        />
      </div>

      <div className="page">
        <div className="page-child page-with-videos">
          {/* <FaultyTerminal
            scale={1.8}
            gridMul={[1.8, 1]}
            digitSize={1.2}
            timeScale={1}
            pause={false}
            scanlineIntensity={1}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0}
            tint="#292E28"
            mouseReact={true}
            mouseStrength={1}
            pageLoadAnimation={false}
            brightness={1}
          /> */}

          <h2 className="video-text">
            In 1963, Ivan Sutherland introduced constraint-based modeling, parametric logic, and graphical feedback. Sketchpad became the foundation of modern CAD and UI/UX systems.
          </h2>

          <div className="video-grid">
            <video src="/sketchpad1.mp4" autoPlay loop muted playsInline className="video-1" />
            <video src="/sketchpad2.mp4" autoPlay loop muted playsInline className="video-2" />
            <video src="/sketchpad3.mp4" autoPlay loop muted playsInline className="video-3" />
            <video src="/sketchpad4.mp4" autoPlay loop muted playsInline className="video-4" />
          </div>

        </div>
      </div>

      <div className="page">
        <div className="page-child page-with-videos">
          <h2 className="video-text">
            "Put that there!"
          </h2>
          <div className="video-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '540px' }}>
            <video src="/putthatthere.mp4" autoPlay loop muted playsInline className="video-1" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </div>

      <div className="page">
        <div className="page-child page-with-videos">
          <h2 className="video-text">
            Meta's Segment Anything Model (SAM)
          </h2>
          <div className="video-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '540px' }}>
            <video src="/sam.mov" autoPlay loop muted playsInline className="video-1" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </div>

      <div className="page">
        <img src="/eyecue3.png" alt="EyeCue 3" className="eyecue-img-3" style={{ width: '80%', height: 'auto' }} />
      </div>

      <div className="page">
        <div style={{ height: '600px', position: 'relative' }}></div>
        <div className="page-child simple-page">
          <div className="content-container">
            <h2 className="page-text">Eyecue is a smartphone-based prototype using dual front and rear cameras to map the user’s gaze to objects in the physical environment. The system then segments the gazed object and sends that visual input to an LLM for contextual interpretation.</h2>
            <img src="./public/mockup.png" alt="mockup" className="page-image" ></img>
          </div>
        </div>
      </div>

      <div className="page">
        <img src="./public/diagram.png" alt="diagram" className="diagram-image" />
      </div>

      <div className="page">
        <div className="page-child framework-page">
          <h1 className="framework-title"> I am building a framework for contextual computing - where the system knows:</h1>
          <div className="circle-container">
            <TiltedCard
              imageSrc="./public/rectangle-1.png"
              className="tilted-card-1"
              altText="where you are"
              captionText="where you are"
              containerHeight="260px"
              containerWidth="260px"
              imageHeight="260px"
              imageWidth="260px"
              rotateAmplitude={30}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <p className="tilted-card-demo-text">
                  what you are<br />looking at
                </p>
              }
            />

            <TiltedCard
              imageSrc="./public/rectangle-2.png"
              className="tilted-card-2"
              altText="where you are"
              captionText="where you are"
              containerHeight="260px"
              containerWidth="260px"
              imageHeight="260px"
              imageWidth="260px"
              rotateAmplitude={30}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <p className="tilted-card-demo-text">
                  why you are<br />looking at what<br />you are looking at
                </p>
              }
            />

            <TiltedCard
              imageSrc="./public/rectangle-3.png"
              className="tilted-card-3"
              altText="where you are"
              captionText="where you are"
              containerHeight="260px"
              containerWidth="260px"
              imageHeight="260px"
              imageWidth="260px"
              rotateAmplitude={30}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent={true}
              overlayContent={
                <p className="tilted-card-demo-text">
                  how it should<br />best respond to you
                </p>
              }
            />


          </div>
        </div>
      </div>



      <div className="page">
        <div className="questions">

          <h1>
            <span className="question-1">
              How can looking itself become expressive or conversational?

            </span>
            <br></br><br></br>
            <span className="question-2">
              How does spatial context shape AI interaction?
            </span>
            <br></br><br></br>
            <span className="question-3">
              What new forms of perception emerge when machines share our view?
            </span>

          </h1>

        </div>
      </div>

      <div className="page">
        <div className="responsive-rectangle">

          <img src="./public/rectangle.png" className="parallax-image" />

          <div className="phrase-container">



            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Embodied Interaction'}
                className={'variable-proximity-demo phrase phrase-1'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Gaze-Based Grounding'}
                className={'variable-proximity-demo phrase phrase-2'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>


            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Natural User Interfaces'}
                className={'variable-proximity-demo phrase phrase-3'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Context-Aware Computing'}
                className={'variable-proximity-demo phrase phrase-1'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Referential Disambiguation'}
                className={'variable-proximity-demo phrase phrase-2'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Attention Modeling'}
                className={'variable-proximity-demo phrase phrase-3'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Egocentric Perception'}
                className={'variable-proximity-demo phrase phrase-1'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Multimodal Interaction'}
                className={'variable-proximity-demo phrase phrase-2'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>

            <div
              ref={containerRef}
              style={{ fontSize: '24px' }}
              className="phrase-box"
            >
              <VariableProximity
                label={'Hyperawareness Analytics'}
                className={'variable-proximity-demo phrase phrase-3'}
                fromFontVariationSettings="'wght' 500, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff='linear'
              />
            </div>






          </div>
        </div>
      </div>

      <div className="page">
        <video src="/demo.mov" autoPlay loop muted playsInline style={{ width: '90%', height: 'auto' }} />
      </div>

      <div className="page">
        <div style={{ position: 'relative', width: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/speechBackground.png" alt="background" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: 'auto', zIndex: 0 }} />
          <video src="/speech.mov" autoPlay loop muted playsInline style={{ position: 'relative', width: '100%', height: 'auto', zIndex: 1 }} />
        </div>
      </div>

      <div className="page">
        <div className="precedent-page">
          <div className="precedent-container">
            <div className="precedent-item precedent-1">
              <h2 className="precedent-label">Smart Home Device Control</h2>
              <img src="./public/map1.png" alt="Smart Home Device Control" />
            </div>
            <div className="precedent-item precedent-2">
              <h2 className="precedent-label">Outdoor Navigation and Spatial Queries</h2>
              <img src="./public/map2.png" alt="Outdoor Navigation and Spatial Queries" />
            </div>
            <div className="precedent-item precedent-3">
              <h2 className="precedent-label">Remote Communication as a Visual Pointer</h2>
              <img src="./public/map3.png" alt="Remote Communication as a Visual Pointer" />
            </div>
            <div className="precedent-item precedent-4">
              <h2 className="precedent-label">Gaze-Guided Photography or Videography</h2>
              <img src="./public/map4.png" alt="Hands-Limited Situational Accessibility" />
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <h2>what's next?</h2>
      </div>



      {/* <div className="page">
        <h3>
          1. Social Attractions<br></br>
          Cafes, Stores, Galleries
          <br></br><br></br>
          2. Temporal Layers<br></br>
          Potential for events
          <br></br><br></br>
          3. Noise Level & Number of pedestrians<br></br>
          Lively or Serene
          <br></br><br></br>
          4. Openness of street / Field of view<br></br>
          How many buildings are you close to
          <br></br><br></br>
          5. Visibility of stores<br></br>
          From how many angles can each storefront be seen
        </h3>
      </div> */}

      <div className="page">
        <img src="./public/vocab.png" alt="Vocab" style={{ width: '70%', height: 'auto' }} />
      </div>

      <div className="page">
        <img src="./public/dashboard.png" alt="Dashboard" className="grasshopper-image" ></img>
      </div>



      <div className="page">
        <h2 className="">
          <span className="bold-text title-screen thank-you" id="title-screen">thank you.</span>
        </h2>
      </div>

      <canvas
        ref={canvasRef}
        className="transition-video"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: 'auto',
          zIndex: 10,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      <img
        src="/eyecue2.png"
        className="fixed-eyecue-2"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: 'auto',
          zIndex: 10,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      <img
        src="/eyecue25.png"
        className="fixed-eyecue-25"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: 'auto',
          zIndex: 10,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

    </div>
  )
}

export default App