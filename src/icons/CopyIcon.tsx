type Props = {
  color?: string;
  size?: number;
};

function CopyIcon({ color, size }: Props) {
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
        d="M120-220v-80h80v80h-80Zm0-140v-80h80v80h-80Zm0-140v-80h80v80h-80ZM260-80v-80h80v80h-80Zm100-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480Zm40 240v-80h80v80h-80Zm-200 0q-33 0-56.5-23.5T120-160h80v80Zm340 0v-80h80q0 33-23.5 56.5T540-80ZM120-640q0-33 23.5-56.5T200-720v80h-80Zm420 80Z"
        fill={color ?? document.body.style.color}
      />
    </svg>
  );
}

export default CopyIcon;
