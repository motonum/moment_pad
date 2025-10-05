type Props = {
  color?: string;
  size?: number;
};

function CheckIcon({ color, size }: Props) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: SVG is used as an icon with aria-label
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      aria-label="copy icon"
      width={size ?? 24}
      height={size ?? 24}
    >
      <path
        d="M378-222 130-470l68-68 180 180 383-383 68 68-451 451Z"
        fill={color ?? document.body.style.color}
      />
    </svg>
  );
}

export default CheckIcon;
