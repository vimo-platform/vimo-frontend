import { SvgXml, type SvgProps } from 'react-native-svg';

type IconProps = SvgProps & {
  size?: number;
};

function createIcon(xml: string, defaultWidth: number, defaultHeight: number) {
  return function Icon({ size, width, height, ...props }: IconProps) {
    return (
      <SvgXml
        xml={xml}
        width={width ?? size ?? defaultWidth}
        height={height ?? size ?? defaultHeight}
        {...props}
      />
    );
  };
}

const PencilDarkIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g id=\"meteor-icons:pencil\">\n<path id=\"Vector\" d=\"M9 15H15.75M12 3C12.2984 2.70163 12.703 2.53401 13.125 2.53401C13.547 2.53401 13.9516 2.70163 14.25 3C14.5484 3.29837 14.716 3.70304 14.716 4.125C14.716 4.54696 14.5484 4.95163 14.25 5.25L5.25 14.25L2.25 15L3 12L12 3Z\" stroke=\"#222222\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</g>\n</svg>";
export const PencilDarkIcon = createIcon(PencilDarkIconXml, 18, 18);

const PencilLightIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g id=\"meteor-icons:pencil\">\n<path id=\"Vector\" d=\"M9 15H15.75M12 3C12.2984 2.70163 12.703 2.53401 13.125 2.53401C13.547 2.53401 13.9516 2.70163 14.25 3C14.5484 3.29837 14.716 3.70304 14.716 4.125C14.716 4.54696 14.5484 4.95163 14.25 5.25L5.25 14.25L2.25 15L3 12L12 3Z\" stroke=\"#F5F5F5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</g>\n</svg>";
export const PencilLightIcon = createIcon(PencilLightIconXml, 18, 18);

const VerificationPendingIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 15 3\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g id=\"Icon\">\n<path d=\"M1.5 0C0.671573 0 0 0.671573 0 1.5C0 2.32843 0.671573 3 1.5 3C2.32843 3 3 2.32843 3 1.5C3 0.671573 2.32843 0 1.5 0Z\" fill=\"#222222\"/>\n<path d=\"M6 1.5C6 0.671573 6.67157 0 7.5 0C8.32843 0 9 0.671573 9 1.5C9 2.32843 8.32843 3 7.5 3C6.67157 3 6 2.32843 6 1.5Z\" fill=\"#222222\"/>\n<path d=\"M12 1.5C12 0.671573 12.6716 0 13.5 0C14.3284 0 15 0.671573 15 1.5C15 2.32843 14.3284 3 13.5 3C12.6716 3 12 2.32843 12 1.5Z\" fill=\"#222222\"/>\n</g>\n</svg>";
export const VerificationPendingIcon = createIcon(VerificationPendingIconXml, 15, 3);

const VerificationCompleteIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 12.5 8.5\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path id=\"Icon\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.2803 0.21967C12.5732 0.512563 12.5732 0.987437 12.2803 1.28033L5.28033 8.28033C4.98744 8.57322 4.51256 8.57322 4.21967 8.28033L0.21967 4.28033C-0.0732233 3.98744 -0.0732233 3.51256 0.21967 3.21967C0.512563 2.92678 0.987437 2.92678 1.28033 3.21967L4.75 6.68934L11.2197 0.21967C11.5126 -0.0732233 11.9874 -0.0732233 12.2803 0.21967Z\" fill=\"#222222\"/>\n</svg>";
export const VerificationCompleteIcon = createIcon(VerificationCompleteIconXml, 12.5, 8.5);

const ScheduleEditIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g id=\"Group\">\n<path id=\"Vector\" d=\"M7.5 18.5H4.5C3.43913 18.5 2.42172 18.0786 1.67157 17.3284C0.921427 16.5783 0.5 15.5609 0.5 14.5V5.5C0.5 4.43913 0.921427 3.42172 1.67157 2.67157C2.42172 1.92143 3.43913 1.5 4.5 1.5H15.5C16.5609 1.5 17.5783 1.92143 18.3284 2.67157C19.0786 3.42172 19.5 4.43913 19.5 5.5V8.5M6.5 0.5V2.5M13.5 0.5V2.5M0.5 6.5H19.5M17 14.143L15.5 15.643\" stroke=\"#818181\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n<path id=\"Vector_2\" d=\"M15.5 20.5C18.2614 20.5 20.5 18.2614 20.5 15.5C20.5 12.7386 18.2614 10.5 15.5 10.5C12.7386 10.5 10.5 12.7386 10.5 15.5C10.5 18.2614 12.7386 20.5 15.5 20.5Z\" stroke=\"#818181\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</g>\n</svg>";
export const ScheduleEditIcon = createIcon(ScheduleEditIconXml, 20, 20);

const BackIconXml = "<svg preserveAspectRatio=\"xMidYMid meet\" width=\"100%\" height=\"100%\" overflow=\"visible\"  viewBox=\"0 0 10.5 19.5\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path id=\"Icon\" d=\"M9.75 18.75L0.75 9.75L9.75 0.75\" stroke=\"#111111\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>";
export const BackIcon = createIcon(BackIconXml, 9, 18);

