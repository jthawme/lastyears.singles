import { breakpointListen } from "../utils";

export const Breakpoint = {
  Desktop: "desktop",
  Tablet: "tablet",
  LargeMobile: "large_mobile",
  Mobile: "mobile",
};

export const BreakPointMixin = {
  computed: {
    currentBreakpoint() {
      if (this.$store.state.breakpoints[Breakpoint.Desktop]) {
        return Breakpoint.Desktop;
      } else if (this.$store.state.breakpoints[Breakpoint.Tablet]) {
        return Breakpoint.Tablet;
      } else if (this.$store.state.breakpoints[Breakpoint.LargeMobile]) {
        return Breakpoint.LargeMobile;
      }

      return Breakpoint.Mobile;
    },
    isDesktop() {
      return this.currentBreakpoint === Breakpoint.Desktop;
    },
    isTablet() {
      return this.currentBreakpoint === Breakpoint.Tablet;
    },
    isLargeMobile() {
      return this.currentBreakpoint === Breakpoint.LargeMobile;
    },
    isMobile() {
      return this.currentBreakpoint === Breakpoint.Mobile;
    },
    isLargeMobileAndAbove() {
      return this.currentBreakpoint !== Breakpoint.Mobile;
    },
    isTabletAndAbove() {
      return (
        this.currentBreakpoint !== Breakpoint.Mobile &&
        this.currentBreakpoint !== Breakpoint.LargeMobile
      );
    },
  },
};

export const BreakPointSet = {
  data() {
    return {
      unlisten: [],
    };
  },
  mounted() {
    this.registerBreakpoints();
  },
  beforeDestroy() {
    this.unlisten.forEach((cb) => cb());
  },
  methods: {
    registerBreakpoints() {
      const largeMobileUnlisten = breakpointListen(
        "(min-width: 560px)",
        (matches) => {
          this.$store.commit("setBreakpoint", {
            key: "isLargeMobile",
            value: matches,
          });
        }
      );
      const tabletUnlisten = breakpointListen(
        "(min-width: 768px)",
        (matches) => {
          this.$store.commit("setBreakpoint", {
            key: "isTablet",
            value: matches,
          });
        }
      );
      const desktopUnlisten = breakpointListen(
        "(min-width: 1080px)",
        (matches) => {
          this.$store.commit("setBreakpoint", {
            key: "isDesktop",
            value: matches,
          });
        }
      );

      this.unlisten.push(() => {
        largeMobileUnlisten();
        tabletUnlisten();
        desktopUnlisten();
      });
    },
  },
};
