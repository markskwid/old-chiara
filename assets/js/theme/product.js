/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';
import initAjaxReviewsPagination from '../chiara/ajax-reviews-pagination'; // Chiara

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });


        $(document).ready(function() {
            if($('.description-video')) {
                let htmlcode = '<li class="videoGallery-item">' +
                            '<a href="#" class="video {{#if @first}}is-active{{/if}}" data-video-item data-video-id="{{id}}">' +
                                '<div class="video-figure">' +
                                    '<img class="lazyload" data-sizes="auto" src="{{cdn \'img/loading.svg\'}}" data-src="//i.ytimg.com/vi/{{id}}/default.jpg"/>' +
                                '</div>' +
                                '<div class="video-body">' +
                                    '<h5 class="video-title">{{title_long}}</h5>' +
                                    '<p class="video-description">{{description_short}}</p>' +
                                '</div>' +
                            '</a>' +
                        '</li>';
                const videoHolder = $('#videoDescription .description-video');
                if(videoHolder && videoHolder.children()) {
                    let blockToInsert = videoHolder.find('iframe').map((i,v) => {
                        const id = v.src.match(/embed\/.*/)[0].substring(6);
                        if(i === 0) {
                            $('#videoDescription .videoGallery-main iframe').attr('src', '//www.youtube.com/embed/'+id);
                        }
                        const res = '<li class="videoGallery-item">' +
                                        '<a href="#" class="video '+(i===0 ? "is-active":"")+'" data-video-item data-video-id="'+id+'">' +
                                            v.outerHTML + 
                                        '</a>' +
                                    '</li>';
                        return res;
                    });
                    blockToInsert.map((k, v) => {
                        $('#videoDescription .videoGallery-list').append(v);
                    });
                    $('#videoDescription .description-video').remove();
                    //videoGallery(true);
                    $('#videoDescription .videoGallery-list .videoGallery-item .video').each(function() {
                        $(this).on('click', function(e) {
                            e.preventDefault();
                            var vID = $(this).data("video-id");
                            $('.videoGallery-main iframe').attr('src', `//www.youtube.com/embed/${vID}`);
                        })
                    });
                }
            }
        });
        if($('.hidden_desc')[0].scrollHeight > 250) {
            $('.read_more_btn').show();
            $('.less_btn').show();
            $('.hidden_desc').css({'max-height': '120px'});
        }
        $('.read_more_btn').on('click', () => {
            $('.hidden_desc').css({'max-height': '100%'});
            $('.read_more_btn').hide();
        });
        $('.less_btn').on('click', () => {
            $('.hidden_desc').css({'max-height': '120px'});
            $('.read_more_btn').show();
        });

        if($(document).width() < 801 && $('.form--addToCart > .productView-options-panel-body').position().top + 300 > window.scrollY + window.screen.height) {
            $('.mobile-fixed-bottom-container').addClass('is-shown');
        }
        $(document).scroll(function() {
            if($(document).width() < 801 && $('.form--addToCart > .productView-options-panel-body').position().top + 300 > window.scrollY + window.screen.height) {
                $('.mobile-fixed-bottom-container').addClass('is-shown');
            } else {
                $('.mobile-fixed-bottom-container').removeClass('is-shown');
            }
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
        initAjaxReviewsPagination(this.context); // Chiara
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }
}
