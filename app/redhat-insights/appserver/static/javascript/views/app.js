import * as Setup from "./setup.js";

define(["react", "splunkjs/splunk"], function (react, splunk_js_sdk) {
  const e = react.createElement;

  const SetupPage = () => {
    const hecName = 'redhatinsights';
    const defaultIndex = 'redhatinsights';
    const [hecToken, setHecToken] = react.useState('');
    const [status, setStatus] = react.useState('');
    const [step, setStep] = react.useState(1);

    return e("div", { class: 'setup_container' }, [
      e("h2", null, "Set up the integration with Red Hat"),
      e("div", null, [
        step == 1
          ? e(SetupForm, { hecName, defaultIndex, status, setStatus, setStep, setHecToken })
          : e(SetupIntegration, { status, setStatus, hecToken })
      ])
    ]);
  };

  const SetupForm = ({ hecName, defaultIndex, status, setStatus, setStep, setHecToken }) => {
    const [inProgress, setInProgress] = react.useState(false);

    const handleSubmit = async (event) => {
      event.preventDefault();

      setStatus('Setting up...');
      setInProgress(true);
      let hecToken;

      try {
        hecToken = await Setup.hecAndIndex(splunk_js_sdk, { hecName, defaultIndex });
      } catch (error) {
        setInProgress(false);
        setStatus(error.message);
        return;
      }

      setStatus('');
      setHecToken(hecToken);
      setStep(2);
    }

    return e("form", { onSubmit: handleSubmit }, [
      e('fieldset', null, [
        e('div', { class: 'form form-horizontal' }, [
          e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
            e('label', { class: 'control-label' }, ['HEC name']),
            e('div', { class: 'controls controls-join' }, [
              e('div', { class: 'control shared-controls-textcontrol control-default' }, [
                e("input", { disabled: true, type: "text", name: "hecName", value: hecName })
              ])
            ])
          ]),
          e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
            e('label', { class: 'control-label' }, ['Default index']),
            e('div', { class: 'controls controls-join' }, [
              e('div', { class: 'control shared-controls-textcontrol control-default' }, [
                e("input", { disabled: true, type: "text", name: "defaultIndex", value: defaultIndex })
              ])
            ])
          ]),
          e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
            e('label', { class: 'control-label' }),
            e('div', { class: 'controls controls-join' }, [
              e("input", { type: "submit", value: "Continue", class: 'btn btn-primary', disabled: inProgress }),
              e('div', { class: 'inline-status' }, [status])
            ])
          ]),
        ])
      ])
    ]);
  };

  const SetupIntegration = ({ status, setStatus, hecToken }) => {
    const [inProgress, setInProgress] = react.useState(false);
    const [isHecCopied, setIsHecCopied] = react.useState(false);

    const handleCopyHEC = async (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(hecToken);
      setIsHecCopied(!isHecCopied);
    }

    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        await Setup.complete(splunk_js_sdk);
      } catch (error) {
        setInProgress(false);
        setStatus(error.message);
        return;
      }
    }

    return e("form", { onSubmit: handleSubmit }, [
      e('fieldset', null, [
        e('div', { class: 'shared-viewstack' }, [
          e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
            e('label', { class: 'control-label' }, ['HTTP Event Collector (HEC) token to copy']),
            e('div', { class: 'controls controls-join' }, [
              e('div', { class: 'control shared-controls-textcontrol control-default' }, [
                e("input", { readonly: true, type: "text", name: "hecToken", value: hecToken }),
                e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
                  e('label', { class: 'control-label' }),
                  e('div', { class: 'controls controls-join' }, [
                    e('a', { class: 'btn btn-primary', onClick: handleCopyHEC }, ['Copy HEC']),
                    e('div', { class: 'inline-status' }, [status])
                  ])
                ]),
              ])
            ])
          ]),
          e('p', null , [
            'Create a new Integration on Red Hat Console at ',
            e('a', { href: 'https://console.redhat.com/beta/settings/integrations', rel: 'noopener' }, [
              'Integration Settings'
            ]),
            '.'
          ]),
          e('p', null , [
            'To create a Splunk integration, copy the HEC token above, paste it into the Secret token field on the Create integration screen in Insights, and then click Save. Follow the example below.'
          ]),
          e('p', null , [
            'See example:'
          ]),
          e('img', {
            src: '/static/app/redhat-insights/images/RH Integrations Settings.png',
            alt: 'New Splunk integration modal example',
            width: '400'
          }),
          e('p', null , [
            'Note, that the port 8088 is a default HTTP Collector port.',
            ' Please set the port according to your Splunk instance.'
          ]),
          e('div', { class: 'control-group shared-controls-controlgroup control-group-default' }, [
            e('label', { class: 'control-label' }),
            e('div', { class: 'controls controls-join' }, [
              e("input", { type: "submit", value: "Finish", class: 'btn btn-primary', disabled: inProgress }),
              e('div', { class: 'inline-status' }, [status])
            ])
          ]),
        ]),
      ])
    ]);
  };

  return e(SetupPage);
});
