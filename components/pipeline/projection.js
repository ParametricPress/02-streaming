import * as React from "react";
import ParametricGraphic from "parametric-components/dist/cjs/issue-02/parametric-graphic";

export default class Projection extends React.PureComponent {
  render() {
    return (
      <div style={this.props.style}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 312 189"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line y1="118.5" x2="309" y2="118.5" stroke="#464646" />
          <line x1="1" y1="22.5" x2="310" y2="22.5" stroke="#464646" />
          <path
            d="M6.80615 146.539C169.5 111.5 259.5 58 302 23"
            stroke="#EE998B"
            stroke-width="2"
            stroke-dasharray="5 2"
          />
          <path
            d="M6.79077 152.546C132.315 124.299 220.5 89.5 301.791 16.5459"
            stroke="#EE998B"
            stroke-width="2"
            stroke-dasharray="5 2"
          />
          <line
            x1="6.87224"
            y1="145.008"
            x2="301.872"
            y2="107.008"
            stroke="#EE998B"
            stroke-width="2"
            stroke-dasharray="5 2"
          />
          <line
            x1="6.87926"
            y1="152.007"
            x2="301.893"
            y2="116.124"
            stroke="#EE998B"
            stroke-width="2"
            stroke-dasharray="5 2"
          />
          <line
            x1="1.5"
            x2="1.5"
            y2="189"
            stroke="#464646"
            stroke-width="3"
          />
          <line
            y1="187.5"
            x2="309"
            y2="187.5"
            stroke="#464646"
            stroke-width="3"
          />
          <path
            d="M13.08 168H18.83V166.47H16.43L17.43 165.5C18.23 164.73 18.78 163.99 18.78 163.01C18.78 161.69 17.85 160.75 16.1 160.75C14.37 160.75 13.29 161.66 13.22 163.45H15.08C15.17 162.6 15.49 162.29 16 162.29C16.51 162.29 16.76 162.61 16.76 163.09C16.76 163.69 16.29 164.3 15.58 165.06L13.08 167.71V168ZM22.7835 166.53C21.9035 166.53 21.5135 165.9 21.5135 164.57V164.27C21.5135 162.95 21.9035 162.3 22.7635 162.3C23.6335 162.3 24.0135 162.96 24.0135 164.27V164.56C24.0135 165.88 23.6635 166.53 22.7835 166.53ZM22.7235 168.12C24.7635 168.12 26.0635 166.79 26.0635 164.52V164.24C26.0635 161.92 24.6435 160.75 22.7635 160.75C20.8735 160.75 19.4635 162.02 19.4635 164.28V164.58C19.4635 166.83 20.7235 168.12 22.7235 168.12ZM26.5077 168H32.2577V166.47H29.8577L30.8577 165.5C31.6577 164.73 32.2077 163.99 32.2077 163.01C32.2077 161.69 31.2777 160.75 29.5277 160.75C27.7977 160.75 26.7177 161.66 26.6477 163.45H28.5077C28.5977 162.6 28.9177 162.29 29.4277 162.29C29.9377 162.29 30.1877 162.61 30.1877 163.09C30.1877 163.69 29.7177 164.3 29.0077 165.06L26.5077 167.71V168ZM36.2113 166.53C35.3313 166.53 34.9413 165.9 34.9413 164.57V164.27C34.9413 162.95 35.3313 162.3 36.1913 162.3C37.0613 162.3 37.4413 162.96 37.4413 164.27V164.56C37.4413 165.88 37.0913 166.53 36.2113 166.53ZM36.1513 168.12C38.1913 168.12 39.4913 166.79 39.4913 164.52V164.24C39.4913 161.92 38.0713 160.75 36.1913 160.75C34.3013 160.75 32.8913 162.02 32.8913 164.28V164.58C32.8913 166.83 34.1513 168.12 36.1513 168.12Z"
            fill="white"
          />
          <path
            d="M270.697 168H276.447V166.47H274.047L275.047 165.5C275.847 164.73 276.397 163.99 276.397 163.01C276.397 161.69 275.467 160.75 273.717 160.75C271.987 160.75 270.907 161.66 270.837 163.45H272.697C272.787 162.6 273.107 162.29 273.617 162.29C274.127 162.29 274.377 162.61 274.377 163.09C274.377 163.69 273.907 164.3 273.197 165.06L270.697 167.71V168ZM280.401 166.53C279.521 166.53 279.131 165.9 279.131 164.57V164.27C279.131 162.95 279.521 162.3 280.381 162.3C281.251 162.3 281.631 162.96 281.631 164.27V164.56C281.631 165.88 281.281 166.53 280.401 166.53ZM280.341 168.12C282.381 168.12 283.681 166.79 283.681 164.52V164.24C283.681 161.92 282.261 160.75 280.381 160.75C278.491 160.75 277.081 162.02 277.081 164.28V164.58C277.081 166.83 278.341 168.12 280.341 168.12ZM287.558 168H289.528V166.63H290.448V165.22H289.528V160.85H287.058L284.078 165.86V166.63H287.558V168ZM286.008 165.22L287.608 162.39V165.22H286.008ZM294.356 166.53C293.476 166.53 293.086 165.9 293.086 164.57V164.27C293.086 162.95 293.476 162.3 294.336 162.3C295.206 162.3 295.586 162.96 295.586 164.27V164.56C295.586 165.88 295.236 166.53 294.356 166.53ZM294.296 168.12C296.336 168.12 297.636 166.79 297.636 164.52V164.24C297.636 161.92 296.216 160.75 294.336 160.75C292.446 160.75 291.036 162.02 291.036 164.28V164.58C291.036 166.83 292.296 168.12 294.296 168.12Z"
            fill="white"
          />
          <path
            d="M248.275 169.75H249.985L252.785 162.77H251.075L250.075 165.56L248.995 162.77H247.055L249.145 167.47L248.275 169.75ZM255.651 168.12C257.231 168.12 258.141 167.45 258.301 166.27H256.621C256.551 166.62 256.301 166.89 255.711 166.89C255.071 166.89 254.671 166.49 254.621 165.8H258.301V165.33C258.301 163.45 257.071 162.63 255.641 162.63C254.061 162.63 252.811 163.69 252.811 165.37V165.45C252.811 167.16 254.011 168.12 255.651 168.12ZM254.641 164.79C254.731 164.16 255.101 163.81 255.641 163.81C256.221 163.81 256.531 164.16 256.561 164.79H254.641ZM260.586 168.12C261.426 168.12 261.886 167.77 262.136 167.39V168H263.876V164.61C263.876 163.22 262.956 162.63 261.516 162.63C260.086 162.63 259.096 163.25 259.016 164.51H260.696C260.736 164.18 260.916 163.89 261.406 163.89C261.976 163.89 262.096 164.22 262.096 164.72V164.84H261.596C259.856 164.84 258.816 165.32 258.816 166.55C258.816 167.66 259.646 168.12 260.586 168.12ZM261.206 166.91C260.786 166.91 260.586 166.72 260.586 166.42C260.586 165.99 260.906 165.85 261.626 165.85H262.096V166.17C262.096 166.62 261.716 166.91 261.206 166.91ZM264.897 168H266.687V165.52C266.687 164.68 267.287 164.34 268.377 164.37V162.7C267.567 162.69 267.017 163.03 266.687 163.81V162.77H264.897V168Z"
            fill="#848484"
          />
          <path
            d="M10.51 114.12C12.33 114.12 13.43 113.12 13.43 111.61C13.43 110.11 12.36 109.32 11.06 109.32C10.18 109.32 9.71 109.66 9.39 110.15C9.43 108.94 9.86 108.26 10.64 108.26C11.15 108.26 11.33 108.51 11.4 108.86H13.28C13.13 107.46 12.18 106.75 10.57 106.75C8.75 106.75 7.36 108.1 7.36 110.43V110.62C7.36 112.66 8.23 114.12 10.51 114.12ZM10.49 112.67C9.9 112.67 9.52 112.24 9.52 111.61C9.52 111.04 9.9 110.6 10.49 110.6C11.08 110.6 11.44 111.03 11.44 111.63C11.44 112.24 11.06 112.67 10.49 112.67ZM15.7906 109.32C15.4206 109.32 15.2006 109.04 15.2006 108.54C15.2006 108.07 15.4206 107.79 15.7906 107.79C16.1606 107.79 16.3606 108.08 16.3606 108.55C16.3606 109.02 16.1606 109.32 15.7906 109.32ZM15.7806 110.36C16.9406 110.36 17.6806 109.56 17.6806 108.52C17.6806 107.5 16.8606 106.77 15.7906 106.77C14.7006 106.77 13.8906 107.54 13.8906 108.55C13.8906 109.58 14.6006 110.36 15.7806 110.36ZM14.8206 114H15.8006L20.7606 106.85H19.7806L14.8206 114ZM19.7706 113.07C19.4106 113.07 19.1906 112.8 19.1906 112.3C19.1906 111.83 19.4106 111.55 19.7706 111.55C20.1506 111.55 20.3506 111.84 20.3506 112.3C20.3506 112.78 20.1506 113.07 19.7706 113.07ZM19.7606 114.12C20.9206 114.12 21.6606 113.32 21.6606 112.28C21.6606 111.25 20.8506 110.53 19.7706 110.53C18.6906 110.53 17.8706 111.29 17.8706 112.31C17.8706 113.34 18.5806 114.12 19.7606 114.12Z"
            fill="white"
          />
          <path
            d="M27.0048 112.79C26.3148 112.79 25.9648 112.3 25.9648 111.4V111.32C25.9648 110.44 26.3348 109.97 27.0048 109.97C27.6848 109.97 28.0348 110.46 28.0348 111.34V111.42C28.0348 112.29 27.6748 112.79 27.0048 112.79ZM26.9948 114.12C28.6048 114.12 29.8548 113.1 29.8548 111.4V111.32C29.8548 109.66 28.6148 108.63 27.0048 108.63C25.3848 108.63 24.1348 109.69 24.1348 111.37V111.45C24.1348 113.14 25.3848 114.12 26.9948 114.12ZM30.9055 114H32.6855V109.99H33.7455V108.77H32.6855V108.31C32.6855 107.97 32.8655 107.74 33.2855 107.74C33.4855 107.74 33.6455 107.77 33.7755 107.81V106.5C33.5355 106.44 33.2855 106.39 32.9555 106.39C31.7155 106.39 30.9055 107.01 30.9055 108.31V108.77H30.2455V109.99H30.9055V114ZM38.9155 115.94C40.7855 115.94 41.8155 115.12 41.8155 113.56V108.77H40.0255V109.51C39.7255 108.98 39.2355 108.63 38.4055 108.63C37.1755 108.63 36.1855 109.61 36.1855 111.15V111.23C36.1855 112.84 37.1855 113.74 38.4055 113.74C39.1855 113.74 39.7555 113.28 40.0255 112.78V113.58C40.0255 114.23 39.7055 114.68 38.9155 114.68C38.2655 114.68 38.0355 114.38 37.9555 114H36.1755C36.3155 115.19 37.1355 115.94 38.9155 115.94ZM39.0355 112.42C38.3955 112.42 38.0155 111.96 38.0155 111.24V111.16C38.0155 110.44 38.3755 109.97 39.0455 109.97C39.7055 109.97 40.0755 110.43 40.0755 111.15V111.22C40.0755 111.96 39.6755 112.42 39.0355 112.42ZM42.9218 114H44.7018V106.47H42.9218V114ZM48.4013 112.79C47.7113 112.79 47.3613 112.3 47.3613 111.4V111.32C47.3613 110.44 47.7313 109.97 48.4013 109.97C49.0813 109.97 49.4313 110.46 49.4313 111.34V111.42C49.4313 112.29 49.0713 112.79 48.4013 112.79ZM48.3913 114.12C50.0013 114.12 51.2513 113.1 51.2513 111.4V111.32C51.2513 109.66 50.0113 108.63 48.4013 108.63C46.7813 108.63 45.5313 109.69 45.5313 111.37V111.45C45.5313 113.14 46.7813 114.12 48.3913 114.12ZM55.442 114.12C56.672 114.12 57.662 113.22 57.662 111.42V111.34C57.662 109.55 56.672 108.63 55.452 108.63C54.662 108.63 54.122 109.05 53.822 109.55V106.47H52.032V114H53.822V113.19C54.082 113.75 54.662 114.12 55.442 114.12ZM54.812 112.75C54.162 112.75 53.772 112.3 53.772 111.41V111.33C53.772 110.45 54.162 109.98 54.812 109.98C55.442 109.98 55.842 110.42 55.842 111.34V111.42C55.842 112.28 55.482 112.75 54.812 112.75ZM59.9277 114.12C60.7677 114.12 61.2277 113.77 61.4777 113.39V114H63.2177V110.61C63.2177 109.22 62.2977 108.63 60.8577 108.63C59.4277 108.63 58.4377 109.25 58.3577 110.51H60.0377C60.0777 110.18 60.2577 109.89 60.7477 109.89C61.3177 109.89 61.4377 110.22 61.4377 110.72V110.84H60.9377C59.1977 110.84 58.1577 111.32 58.1577 112.55C58.1577 113.66 58.9877 114.12 59.9277 114.12ZM60.5477 112.91C60.1277 112.91 59.9277 112.72 59.9277 112.42C59.9277 111.99 60.2477 111.85 60.9677 111.85H61.4377V112.17C61.4377 112.62 61.0577 112.91 60.5477 112.91ZM64.289 114H66.069V106.47H64.289V114ZM71.7111 114.12C73.2911 114.12 74.2011 113.45 74.3611 112.27H72.6811C72.6111 112.62 72.3611 112.89 71.7711 112.89C71.1311 112.89 70.7311 112.49 70.6811 111.8H74.3611V111.33C74.3611 109.45 73.1311 108.63 71.7011 108.63C70.1211 108.63 68.8711 109.69 68.8711 111.37V111.45C68.8711 113.16 70.0711 114.12 71.7111 114.12ZM70.7011 110.79C70.7911 110.16 71.1611 109.81 71.7011 109.81C72.2811 109.81 72.5911 110.16 72.6211 110.79H70.7011ZM75.1277 114H76.9177V110.97C76.9177 110.4 77.2377 110.09 77.7177 110.09C78.1277 110.09 78.3877 110.35 78.3877 110.88V114H80.1577V110.97C80.1577 110.4 80.4777 110.09 80.9577 110.09C81.3677 110.09 81.6277 110.35 81.6277 110.88V114H83.4177V110.58C83.4177 109.27 82.6977 108.63 81.7077 108.63C81.0477 108.63 80.4277 108.89 79.9777 109.5C79.7277 108.93 79.2477 108.63 78.5577 108.63C77.7477 108.63 77.1977 109.07 76.9177 109.57V108.77H75.1277V114ZM84.4843 114H86.2743V108.77H84.4843V114ZM85.3743 108.27C85.9343 108.27 86.3643 107.88 86.3643 107.35C86.3643 106.82 85.9343 106.42 85.3743 106.42C84.8143 106.42 84.3943 106.82 84.3943 107.35C84.3943 107.88 84.8143 108.27 85.3743 108.27ZM89.4335 114.12C90.8835 114.12 91.8035 113.56 91.8035 112.32C91.8035 111.2 91.1035 110.82 89.6535 110.64C89.0135 110.56 88.7735 110.46 88.7735 110.21C88.7735 109.97 88.9735 109.8 89.3635 109.8C89.7735 109.8 89.9635 109.97 90.0335 110.32H91.6535C91.5335 109.07 90.6335 108.63 89.3435 108.63C88.1335 108.63 87.1035 109.19 87.1035 110.35C87.1035 111.44 87.6935 111.85 89.0935 112.03C89.8135 112.13 90.0635 112.25 90.0635 112.5C90.0635 112.76 89.8635 112.93 89.4235 112.93C88.9135 112.93 88.7435 112.72 88.6835 112.34H87.0335C87.0735 113.5 87.9435 114.12 89.4335 114.12ZM94.6288 114.12C96.0788 114.12 96.9988 113.56 96.9988 112.32C96.9988 111.2 96.2988 110.82 94.8488 110.64C94.2088 110.56 93.9688 110.46 93.9688 110.21C93.9688 109.97 94.1688 109.8 94.5588 109.8C94.9688 109.8 95.1588 109.97 95.2288 110.32H96.8488C96.7288 109.07 95.8288 108.63 94.5388 108.63C93.3288 108.63 92.2988 109.19 92.2988 110.35C92.2988 111.44 92.8888 111.85 94.2888 112.03C95.0088 112.13 95.2588 112.25 95.2588 112.5C95.2588 112.76 95.0588 112.93 94.6188 112.93C94.1088 112.93 93.9388 112.72 93.8788 112.34H92.2288C92.2688 113.5 93.1388 114.12 94.6288 114.12ZM97.7753 114H99.5653V108.77H97.7753V114ZM98.6653 108.27C99.2253 108.27 99.6553 107.88 99.6553 107.35C99.6553 106.82 99.2253 106.42 98.6653 106.42C98.1053 106.42 97.6853 106.82 97.6853 107.35C97.6853 107.88 98.1053 108.27 98.6653 108.27ZM103.265 112.79C102.575 112.79 102.225 112.3 102.225 111.4V111.32C102.225 110.44 102.595 109.97 103.265 109.97C103.945 109.97 104.295 110.46 104.295 111.34V111.42C104.295 112.29 103.935 112.79 103.265 112.79ZM103.255 114.12C104.865 114.12 106.115 113.1 106.115 111.4V111.32C106.115 109.66 104.875 108.63 103.265 108.63C101.645 108.63 100.395 109.69 100.395 111.37V111.45C100.395 113.14 101.645 114.12 103.255 114.12ZM106.895 114H108.685V111.07C108.685 110.4 109.045 110.08 109.575 110.08C110.095 110.08 110.325 110.37 110.325 110.96V114H112.115V110.6C112.115 109.26 111.415 108.63 110.405 108.63C109.535 108.63 108.965 109.07 108.685 109.61V108.77H106.895V114ZM115.185 114.12C116.635 114.12 117.555 113.56 117.555 112.32C117.555 111.2 116.855 110.82 115.405 110.64C114.765 110.56 114.525 110.46 114.525 110.21C114.525 109.97 114.725 109.8 115.115 109.8C115.525 109.8 115.715 109.97 115.785 110.32H117.405C117.285 109.07 116.385 108.63 115.095 108.63C113.885 108.63 112.855 109.19 112.855 110.35C112.855 111.44 113.445 111.85 114.845 112.03C115.565 112.13 115.815 112.25 115.815 112.5C115.815 112.76 115.615 112.93 115.175 112.93C114.665 112.93 114.495 112.72 114.435 112.34H112.785C112.825 113.5 113.695 114.12 115.185 114.12Z"
            fill="#848484"
          />
          <path
            d="M8.68 18H10.73V10.85H8.96L7.32 12V13.71L8.68 12.87V18ZM15.1131 18H17.0831V16.63H18.0031V15.22H17.0831V10.85H14.6131L11.6331 15.86V16.63H15.1131V18ZM13.5631 15.22L15.1631 12.39V15.22H13.5631ZM20.0777 13.32C19.7077 13.32 19.4877 13.04 19.4877 12.54C19.4877 12.07 19.7077 11.79 20.0777 11.79C20.4477 11.79 20.6477 12.08 20.6477 12.55C20.6477 13.02 20.4477 13.32 20.0777 13.32ZM20.0677 14.36C21.2277 14.36 21.9677 13.56 21.9677 12.52C21.9677 11.5 21.1477 10.77 20.0777 10.77C18.9877 10.77 18.1777 11.54 18.1777 12.55C18.1777 13.58 18.8877 14.36 20.0677 14.36ZM19.1077 18H20.0877L25.0477 10.85H24.0677L19.1077 18ZM24.0577 17.07C23.6977 17.07 23.4777 16.8 23.4777 16.3C23.4777 15.83 23.6977 15.55 24.0577 15.55C24.4377 15.55 24.6377 15.84 24.6377 16.3C24.6377 16.78 24.4377 17.07 24.0577 17.07ZM24.0477 18.12C25.2077 18.12 25.9477 17.32 25.9477 16.28C25.9477 15.25 25.1377 14.53 24.0577 14.53C22.9777 14.53 22.1577 15.29 22.1577 16.31C22.1577 17.34 22.8677 18.12 24.0477 18.12Z"
            fill="white"
          />
          <path
            d="M31.2919 16.79C30.6019 16.79 30.2519 16.3 30.2519 15.4V15.32C30.2519 14.44 30.6219 13.97 31.2919 13.97C31.9719 13.97 32.3219 14.46 32.3219 15.34V15.42C32.3219 16.29 31.9619 16.79 31.2919 16.79ZM31.2819 18.12C32.8919 18.12 34.1419 17.1 34.1419 15.4V15.32C34.1419 13.66 32.9019 12.63 31.2919 12.63C29.6719 12.63 28.4219 13.69 28.4219 15.37V15.45C28.4219 17.14 29.6719 18.12 31.2819 18.12ZM35.1926 18H36.9726V13.99H38.0326V12.77H36.9726V12.31C36.9726 11.97 37.1526 11.74 37.5726 11.74C37.7726 11.74 37.9326 11.77 38.0626 11.81V10.5C37.8226 10.44 37.5726 10.39 37.2426 10.39C36.0026 10.39 35.1926 11.01 35.1926 12.31V12.77H34.5326V13.99H35.1926V18ZM43.2027 19.94C45.0727 19.94 46.1027 19.12 46.1027 17.56V12.77H44.3127V13.51C44.0127 12.98 43.5227 12.63 42.6927 12.63C41.4627 12.63 40.4727 13.61 40.4727 15.15V15.23C40.4727 16.84 41.4727 17.74 42.6927 17.74C43.4727 17.74 44.0427 17.28 44.3127 16.78V17.58C44.3127 18.23 43.9927 18.68 43.2027 18.68C42.5527 18.68 42.3227 18.38 42.2427 18H40.4627C40.6027 19.19 41.4227 19.94 43.2027 19.94ZM43.3227 16.42C42.6827 16.42 42.3027 15.96 42.3027 15.24V15.16C42.3027 14.44 42.6627 13.97 43.3327 13.97C43.9927 13.97 44.3627 14.43 44.3627 15.15V15.22C44.3627 15.96 43.9627 16.42 43.3227 16.42ZM47.2089 18H48.9889V10.47H47.2089V18ZM52.6884 16.79C51.9984 16.79 51.6484 16.3 51.6484 15.4V15.32C51.6484 14.44 52.0184 13.97 52.6884 13.97C53.3684 13.97 53.7184 14.46 53.7184 15.34V15.42C53.7184 16.29 53.3584 16.79 52.6884 16.79ZM52.6784 18.12C54.2884 18.12 55.5384 17.1 55.5384 15.4V15.32C55.5384 13.66 54.2984 12.63 52.6884 12.63C51.0684 12.63 49.8184 13.69 49.8184 15.37V15.45C49.8184 17.14 51.0684 18.12 52.6784 18.12ZM59.7291 18.12C60.9591 18.12 61.9491 17.22 61.9491 15.42V15.34C61.9491 13.55 60.9591 12.63 59.7391 12.63C58.9491 12.63 58.4091 13.05 58.1091 13.55V10.47H56.3191V18H58.1091V17.19C58.3691 17.75 58.9491 18.12 59.7291 18.12ZM59.0991 16.75C58.4491 16.75 58.0591 16.3 58.0591 15.41V15.33C58.0591 14.45 58.4491 13.98 59.0991 13.98C59.7291 13.98 60.1291 14.42 60.1291 15.34V15.42C60.1291 16.28 59.7691 16.75 59.0991 16.75ZM64.2148 18.12C65.0548 18.12 65.5148 17.77 65.7648 17.39V18H67.5048V14.61C67.5048 13.22 66.5848 12.63 65.1448 12.63C63.7148 12.63 62.7248 13.25 62.6448 14.51H64.3248C64.3648 14.18 64.5448 13.89 65.0348 13.89C65.6048 13.89 65.7248 14.22 65.7248 14.72V14.84H65.2248C63.4848 14.84 62.4448 15.32 62.4448 16.55C62.4448 17.66 63.2748 18.12 64.2148 18.12ZM64.8348 16.91C64.4148 16.91 64.2148 16.72 64.2148 16.42C64.2148 15.99 64.5348 15.85 65.2548 15.85H65.7248V16.17C65.7248 16.62 65.3448 16.91 64.8348 16.91ZM68.5761 18H70.3561V10.47H68.5761V18ZM75.9982 18.12C77.5782 18.12 78.4882 17.45 78.6482 16.27H76.9682C76.8982 16.62 76.6482 16.89 76.0582 16.89C75.4182 16.89 75.0182 16.49 74.9682 15.8H78.6482V15.33C78.6482 13.45 77.4182 12.63 75.9882 12.63C74.4082 12.63 73.1582 13.69 73.1582 15.37V15.45C73.1582 17.16 74.3582 18.12 75.9982 18.12ZM74.9882 14.79C75.0782 14.16 75.4482 13.81 75.9882 13.81C76.5682 13.81 76.8782 14.16 76.9082 14.79H74.9882ZM79.4148 18H81.2048V14.97C81.2048 14.4 81.5248 14.09 82.0048 14.09C82.4148 14.09 82.6748 14.35 82.6748 14.88V18H84.4448V14.97C84.4448 14.4 84.7648 14.09 85.2448 14.09C85.6548 14.09 85.9148 14.35 85.9148 14.88V18H87.7048V14.58C87.7048 13.27 86.9848 12.63 85.9948 12.63C85.3348 12.63 84.7148 12.89 84.2648 13.5C84.0148 12.93 83.5348 12.63 82.8448 12.63C82.0348 12.63 81.4848 13.07 81.2048 13.57V12.77H79.4148V18ZM88.7714 18H90.5614V12.77H88.7714V18ZM89.6614 12.27C90.2214 12.27 90.6514 11.88 90.6514 11.35C90.6514 10.82 90.2214 10.42 89.6614 10.42C89.1014 10.42 88.6814 10.82 88.6814 11.35C88.6814 11.88 89.1014 12.27 89.6614 12.27ZM93.7206 18.12C95.1706 18.12 96.0906 17.56 96.0906 16.32C96.0906 15.2 95.3906 14.82 93.9406 14.64C93.3006 14.56 93.0606 14.46 93.0606 14.21C93.0606 13.97 93.2606 13.8 93.6506 13.8C94.0606 13.8 94.2506 13.97 94.3206 14.32H95.9406C95.8206 13.07 94.9206 12.63 93.6306 12.63C92.4206 12.63 91.3906 13.19 91.3906 14.35C91.3906 15.44 91.9806 15.85 93.3806 16.03C94.1006 16.13 94.3506 16.25 94.3506 16.5C94.3506 16.76 94.1506 16.93 93.7106 16.93C93.2006 16.93 93.0306 16.72 92.9706 16.34H91.3206C91.3606 17.5 92.2306 18.12 93.7206 18.12ZM98.9159 18.12C100.366 18.12 101.286 17.56 101.286 16.32C101.286 15.2 100.586 14.82 99.1359 14.64C98.4959 14.56 98.2559 14.46 98.2559 14.21C98.2559 13.97 98.4559 13.8 98.8459 13.8C99.2559 13.8 99.4459 13.97 99.5159 14.32H101.136C101.016 13.07 100.116 12.63 98.8259 12.63C97.6159 12.63 96.5859 13.19 96.5859 14.35C96.5859 15.44 97.1759 15.85 98.5759 16.03C99.2959 16.13 99.5459 16.25 99.5459 16.5C99.5459 16.76 99.3459 16.93 98.9059 16.93C98.3959 16.93 98.2259 16.72 98.1659 16.34H96.5159C96.5559 17.5 97.4259 18.12 98.9159 18.12ZM102.062 18H103.852V12.77H102.062V18ZM102.952 12.27C103.512 12.27 103.942 11.88 103.942 11.35C103.942 10.82 103.512 10.42 102.952 10.42C102.392 10.42 101.972 10.82 101.972 11.35C101.972 11.88 102.392 12.27 102.952 12.27ZM107.552 16.79C106.862 16.79 106.512 16.3 106.512 15.4V15.32C106.512 14.44 106.882 13.97 107.552 13.97C108.232 13.97 108.582 14.46 108.582 15.34V15.42C108.582 16.29 108.222 16.79 107.552 16.79ZM107.542 18.12C109.152 18.12 110.402 17.1 110.402 15.4V15.32C110.402 13.66 109.162 12.63 107.552 12.63C105.932 12.63 104.682 13.69 104.682 15.37V15.45C104.682 17.14 105.932 18.12 107.542 18.12ZM111.182 18H112.972V15.07C112.972 14.4 113.332 14.08 113.862 14.08C114.382 14.08 114.612 14.37 114.612 14.96V18H116.402V14.6C116.402 13.26 115.702 12.63 114.692 12.63C113.822 12.63 113.252 13.07 112.972 13.61V12.77H111.182V18ZM119.473 18.12C120.923 18.12 121.843 17.56 121.843 16.32C121.843 15.2 121.143 14.82 119.693 14.64C119.053 14.56 118.813 14.46 118.813 14.21C118.813 13.97 119.013 13.8 119.403 13.8C119.813 13.8 120.003 13.97 120.073 14.32H121.693C121.573 13.07 120.673 12.63 119.383 12.63C118.173 12.63 117.143 13.19 117.143 14.35C117.143 15.44 117.733 15.85 119.133 16.03C119.853 16.13 120.103 16.25 120.103 16.5C120.103 16.76 119.903 16.93 119.463 16.93C118.953 16.93 118.783 16.72 118.723 16.34H117.073C117.113 17.5 117.983 18.12 119.473 18.12Z"
            fill="#848484"
          />
          <rect x="300" y="14" width="4" height="4" fill="#EE998B" />
          <rect x="300" y="21" width="4" height="4" fill="#EE998B" />
          <rect x="300" y="105" width="4" height="4" fill="#EE998B" />
          <rect x="300" y="114" width="4" height="4" fill="#EE998B" />
          <rect x="5" y="144" width="4" height="4" fill="#EE998B" />
          <rect x="5" y="150" width="4" height="4" fill="#EE998B" />
          <line
            x1="8"
            y1="158"
            x2="8"
            y2="172"
            stroke="white"
            stroke-width="2"
          />
          <line
            x1="303"
            y1="158"
            x2="303"
            y2="172"
            stroke="white"
            stroke-width="2"
          />
        </svg>
      </div>
    );
  }
}
