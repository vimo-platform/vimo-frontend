const fs = require('fs');
const path = require('path');

const icons = [
  ['PencilDarkIcon', 'pencil-dark.png', 18, 18],
  ['PencilLightIcon', 'pencil-light.png', 18, 18],
  ['VerificationPendingIcon', 'verification-pending.png', 15, 3],
  ['VerificationCompleteIcon', 'verification-complete.png', 12.5, 8.5],
  ['ScheduleEditIcon', 'schedule-edit.png', 20, 20],
  ['GnbParticipationIcon', 'gnb-participation.png', 22, 22],
  ['GnbSearchIcon', 'gnb-search.png', 22, 22],
  ['GnbVerificationIcon', 'gnb-verification.png', 22, 22],
  ['GnbMyPageIcon', 'gnb-my-page.png', 22, 22],
  ['BackIcon', 'back.png', 9, 18],
];

function cleanSvg(svg) {
  return svg
    .replace(/var\(--[^,]+,\s*([^)]+)\)/g, '$1')
    .replace(/style="display: block;"/g, '')
    .replace(/preserveAspectRatio="none"/g, 'preserveAspectRatio="xMidYMid meet"')
    .trim();
}

let output = `import { SvgXml, type SvgProps } from 'react-native-svg';

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

`;

for (const [name, fileName, width, height] of icons) {
  const svg = fs.readFileSync(path.join('assets', 'icons', fileName), 'utf8');
  const xml = JSON.stringify(cleanSvg(svg));
  output += `const ${name}Xml = ${xml};
export const ${name} = createIcon(${name}Xml, ${width}, ${height});

`;
}

fs.writeFileSync(path.join('src', 'components', 'common', 'icons.tsx'), output);
