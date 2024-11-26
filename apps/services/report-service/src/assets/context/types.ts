// Types matching pfa-buyer-motives.json structure
export interface BuyerMotiveType {
  id: string;          // e.g., "2-1"
  name: string;        // e.g., "Achiever-Belonger"
  text_1: string;
  text_2: string;
  text_3: string;
}

export interface PFABuyerMotives {
  types: {
    type: BuyerMotiveType[];
  };
}

// Types for pfa-common.json
export interface PFACommon {
  data: {
    language: string;
    date_format: string;
    candg: {
      title: string;
      values: {
        title: string;
        belonger: string;
        achiever: string;
        societal: string;
        emulator: string;
      };
      compliance: {
        title: string;
        low: string;
        average: string;
        high: string;
        very_high: string;
      };
      sog: {
        title: string;
        entrepreneurial: string;
        partnership: string;
        systematic: string;
        bureaucracy: string;
        intrepreneurial: string;
      };
      core_comp: {
        title: string;
        admin: string;
        sales: string;
        marketing: string;
        technical: string;
        client: string;
      };
      work_style: {
        title: string;
        director: string;
        promoter: string;
        collaborator: string;
        thinker: string;
      };
      focus_pref: {
        title: string;
        aware: string;
        focused: string;
        strategic: string;
        systematic: string;
      };
      leader_style: {
        title: string;
        autocratic: string;
        paternalistic: string;
        democratic: string;
        laissez: string;
      };
      sales_potential: {
        title: string;
        low: string;
        average: string;
        above_average: string;
        high: string;
        very_high: string;
      };
      business_dev: {
        title: string;
        contractor: string;
        entrepreneur: string;
        single: string;
        multi: string;
        area: string;
      };
      sales_orientation: {
        title: string;
        consultative: string;
        relational: string;
        competitive: string;
      };
    };
    values_1: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
    };
    values_2: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
      text_4: string;
      text_5: string;
    };
    workstyle_1: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
      director: string;
      promoter: string;
      collaborator: string;
      thinker: string;
    };
    workstyle_2: {
      title: string;
      text_1: string;
      text_2: string;
    };
    focus_pref: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
    };
    leadership_style: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
      text_4: string;
      text_5: string;
      text_6: string;
      low: string;
      average: string;
      high: string;
      very_high: string;
    };
    core_competency: {
      title: string;
      text_1: string;
      text_2: string;
      text_3: string;
      text_4: string;
      technical: string;
      administrative: string;
      client_services: string;
      marketing: string;
      sales: string;
    };
    metaprograms: {
      title: string;
      text_1: string;
      text_2: string;
      direction_sort: string;
      frame_of_reference: string;
      task_attitude: string;
      chunk_size: string;
      communication_style: string;
    };
    business_needs: {
      title: string;
      text_1: string;
    };
    icr: {
      title: string;
      age: string;
      sex: string;
      female: string;
      male: string;
      education: string;
      highschool: string;
      yearsofcollege: string;
      college: string;
      years: string;
      graduateschool: string;
      income: string;
      maritalstatus: string;
      single: string;
      married: string;
      divorced: string;
      widowed: string;
      children: string;
      tpa: string;
      overallcompatibility: string;
      valuesandmotives: string;
      compliance: string;
      stageofgrowth: string;
      competency: string;
      workstyle: string;
      focuspreference: string;
      leadershipandrules: string;
      topperformer: string;
      compatibility: string;
      values: string;
      focus: string;
      leadership: string;
      candidate: string;
      competencies: string;
      corecompetency: string;
      primary: string;
      secondary: string;
      leadershipandrulesstyle: string;
      capacity: string;
      salespotential: string;
      businessdevelopment: string;
      salesorientation: string;
    };
  };
}
