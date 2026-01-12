# HHMI Workspace

A Research Communication Workspace built on Curvenote SCMS, providing integrated tools and services for the HHMI Research Community.

## What is HHMI Workspace?

The HHMI Workspace is a specialized deployment of the Curvenote Scientific Content Management System (SCMS), designed to help researchers navigate compliance with publishing policies and strengthen the integrity of their work. It provides an integrated platform for compliance support and research communication, combining modular extension modules that work together to deliver a complete workspace solution.

## Extension Modules

The workspace is built from extension modules that provide specialized functionality. Each module can be configured independently and works seamlessly with the others to deliver a complete solution.

### [Compliance Extension](packages/compliance/README.md)

The Compliance Extension provides tools and workflows for managing open science compliance requirements. It helps researchers and institutions navigate complex open access policy requirements from funders like HHMI and NIH.

**Key Features:**
- **Compliance Wizard**: An interactive tool that guides researchers through policy requirements by asking targeted questions about their publication plans
- **Publication Tracking**: Automated tracking of publication compliance status across multiple outlets and policies
- **Scientist Management**: Tools for managing researcher profiles and tracking compliance across publications
- **Compliance Reporting**: Generation and sharing of compliance reports for individual researchers or institutions
- **BioRxiv Integration**: Support for tracking preprints and their compliance status

**Use Cases:**
- Track and ensure compliance with HHMI's open access publication requirements
- Monitor and report on compliance with NIH public access policy requirements
- Generate compliance reports for institutional administrators
- Enable researchers to check their own compliance status and receive guidance on meeting requirements
- Monitor compliance status of preprints published on BioRxiv

### [PMC Extension](packages/pmc/README.md)

The PMC Extension streamlines the process of submitting research publications to PubMed Central, which is required for NIH-funded research and supports broader open access goals.

**Key Features:**
- **Deposit Workflows**: Guided workflows for submitting manuscripts and associated files to PMC
- **Metadata Management**: Tools for collecting, validating, and managing publication metadata required for PMC submissions
- **Journal Search**: Integration with NIH journal databases to identify appropriate journals and validate submission requirements
- **Email Processing**: Automated processing of email-based submissions and notifications from PMC
- **Grant Integration**: Links submissions to HHMI grants and tracks grant-related compliance requirements
- **Workflow Tracking**: Visual status tracking for submissions through the PMC review and deposit process

**Use Cases:**
- Submit NIH-funded research to PMC to meet public access policy requirements
- Deposit publications to PMC as part of open access compliance strategies
- Support institutional processes for managing PMC submissions across multiple researchers
- Collect and validate publication metadata in a centralized system
- Track PMC submissions linked to specific grants for reporting purposes

Additional extension modules will be added in the future to expand the workspace's capabilities.

## Open Source

This repository is open source, licensed under the MIT License. The open source nature of the HHMI Workspace provides several key benefits:

- **Transparency**: Full visibility into how the workspace operates and processes data
- **Extensibility**: The modular architecture allows institutions to customize and extend functionality to meet their specific needs
- **Community**: Open source enables collaboration, contributions, and shared improvements across the research community
- **Independence**: Institutions can deploy, maintain, and modify the workspace without vendor lock-in

Both the HHMI Workspace and the underlying [Curvenote SCMS platform](https://github.com/curvenote/curvenote) are open source, ensuring complete transparency and control over your research infrastructure.

## Built on Curvenote SCMS

The HHMI Workspace is built on [Curvenote SCMS](https://github.com/curvenote/curvenote), an open source Scientific Content Management System. Curvenote SCMS provides the core platform for organizing, accessing, and publishing scientific content, with a modular extension system that allows for specialized functionality to be added as needed.

## Architecture

The HHMI Workspace is implemented as a collection of extension modules that integrate with the Curvenote SCMS platform. Each extension module provides specific functionality and can be configured independently.

The platform's extensible architecture allows institutions to customize and extend the workspace to meet their specific needs. Extension modules can:

- Register new routes and navigation items
- Add custom workflows and task cards
- Integrate with external services and APIs
- Define custom data models and database schemas
- Provide specialized UI components and interfaces

To add additional extensions, developers can create new extension modules following the same structure as the existing compliance and PMC extensions. Each extension module is a self-contained package that exports an extension configuration, which the Curvenote SCMS platform loads at runtime. Extensions can be developed independently and integrated into the workspace through configuration.

## Branding

The `branding/` folder contains HHMI-specific branding assets and configuration. **This folder is excluded from the MIT license** and contains materials copyrighted by HHMI. Please refer to HHMI for terms of use regarding any assets or information in the branding folder.

## License

The code in this repository is licensed under the MIT License. See [LICENSE](LICENSE) for details.

**Note**: The `branding/` folder is excluded from the MIT license and contains HHMI copyright materials. See the [Branding](#branding) section above for more information.
