'use strict';

const BODY = document.body;

// Remove class 'no-js'
BODY.classList.remove('no-js');

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

class Ruler {
  constructor(nums = []) {
    this.nums = nums;
    this.total = nums.reduce((sum, num) => sum + num, 0);
    this.decimalSize = 39;
    this.decimalsList = document.querySelector('.b-rule_decimals');
    this.axisWrap = document.querySelector('.b-rule_axis');
    this.exampleTotal = document.querySelector('.b-example_total');
    this.exampleNums = Array.from(document.querySelectorAll('.b-example_num'));
  }

  renderSegment(num, prevNum, i) {
    const segmentParent = el('div', {
      class: 'b-rule_segment',
      style: `width: ${this.decimalSize * num}px; left: ${this.decimalSize * (prevNum === undefined ? 0 : prevNum)}px`
    }, [
      el('input', {
        class: 'b-segment_input',
        type: 'text',
        autofocus: ''
      }),
      el('div', { class: 'b-segment_arrow' })
    ]);

    setTimeout(() => this.axisWrap.insertBefore(segmentParent, this.decimalsList), 2000);

    return segmentParent;
  }

  checkSegment(segment, num, i) {
    const segmentInput = segment.querySelector('.b-segment_input');

    segmentInput.addEventListener('input', (e) => {
      const $this = e.target;
      if (parseInt($this.value) === num) {
        $this.classList.remove('is-error');
        $this.setAttribute('disabled', '');
        this.exampleNums[i].classList.remove('is-current');
      } else {
        $this.classList.add('is-error');
        this.exampleNums[i].classList.add('is-current');
      }
    });
  }
}

const ruler = new Ruler([7, 4]);

ruler.nums.forEach((num, i) => {
  const segment = ruler.renderSegment(num, ruler.nums[i - 1], i);
  ruler.checkSegment(segment, num, i);
});
