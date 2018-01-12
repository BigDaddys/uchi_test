'use strict';

const BODY = document.body;

// Remove class 'no-js'
BODY.classList.remove('no-js');

;(function () {
  const numList = [7, 4];
  const total = numList.reduce((sum, num) => sum + num, 0);
  const DECIMAL_WIDTH = 39;
  const decimalsList = document.querySelector('.b-rule_decimals');
  const axisWrap = document.querySelector('.b-rule_axis');
  const exampleTotal = document.querySelector('.b-example_total');
  const exampleNums = Array.from(document.querySelectorAll('.b-example_num'));
  const completeList = [];

  numList.forEach((num, i) => {
    const segment = renderSegment(num, i);
    const segmentInput = segment.querySelector('.b-segment_input');

    segmentInput.addEventListener('input', (e) => {
      const $this = e.target;

      if (parseInt($this.value) === num) {
        $this.classList.remove('is-error');
        $this.setAttribute('disabled', '');

        exampleNums[i].classList.remove('is-current');

        completeList.push(num);

        if (completeList.length === numList.length) {
          exampleTotal.removeAttribute('disabled');
          exampleTotal.value = '';

          exampleTotal.addEventListener('input', (e) => {
            const $this = e.target;

            if (parseInt($this.value) === total) {
              $this.classList.remove('is-error');
              $this.setAttribute('disabled', '');
            } else {
              $this.classList.add('is-error');
            }
          });
        }
      } else {
        $this.classList.add('is-error');
        exampleNums[i].classList.add('is-current');
      }
    });
  });

  // Render Segment
  function renderSegment(num, index) {
    const prevNum = numList[index - 1];
    const segmentParent = el('div', {
      class: 'b-rule_segment',
      style: `width: ${DECIMAL_WIDTH * num}px; left: ${DECIMAL_WIDTH * (prevNum === undefined ? 0 : prevNum)}px`
    }, [
      el('input', {
        class: 'b-segment_input',
        type: 'text',
        autofocus: ''
      }),
      el('div', { class: 'b-segment_arrow' })
    ]);

    setTimeout(() => axisWrap.insertBefore(segmentParent, decimalsList), 2000);

    return segmentParent;
  }

  // Create New Element
  function el(tagName, attributes, children) {
    const element = document.createElement(tagName);

    if (typeof attributes === 'object') {
      Object.keys(attributes).forEach(i => element.setAttribute(i, attributes[i]));
    }

    if (typeof children === 'string') {
      element.textContent = children;
    } else if (children instanceof Array) {
      children.forEach(child => element.appendChild(child));
    }

    return element;
  }
})();