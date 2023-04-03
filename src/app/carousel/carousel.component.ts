import { Component, Input, OnInit } from '@angular/core';

interface carouselImage {
  imageSrc: string;
  imageAlt: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  @Input() images: carouselImage[] = []
  @Input() postDetailImages: carouselImage[] = []

  @Input() indicators = true;
  @Input() controls = true;

  @Input() autoSlide = false;
  @Input() slideInterval = 3000;

  selectedIndex = 0;

  ngOnInit(): void {
    if(this.autoSlide) {
      this.autoSliding();
    }
  }

  autoSliding() {
    setInterval(() => {
      (this.selectedIndex === (this.images.length || this.postDetailImages.length) - 1) ? this.selectedIndex = 0 : this.selectedIndex++;
    }, this.slideInterval);
  }

  selectSlide(i: number) {
    this.selectedIndex = i;
  }

  onPrevClick() {
    (this.selectedIndex === 0) ? this.selectedIndex = this.postDetailImages.length - 1 : this.selectedIndex--;
  }
  onNextClick() {
    (this.selectedIndex === this.postDetailImages.length - 1) ? this.selectedIndex = 0 : this.selectedIndex++;
  }

}